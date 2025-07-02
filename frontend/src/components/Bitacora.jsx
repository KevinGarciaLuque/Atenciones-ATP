import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Table, Spinner, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Bitacora = () => {
  const { token } = useAuth();
  const [bitacora, setBitacora] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const obtenerBitacora = async () => {
    setCargando(true);
    try {
      const params = {};
      if (desde && hasta) {
        params.desde = desde;
        params.hasta = hasta;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bitacora`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setBitacora(res.data);
    } catch (err) {
      setMensajeError(err.response?.data?.mensaje || 'Error al cargar la bitácora');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerBitacora();
  }, [token]);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Bitácora - ATP Hospital María', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Fecha', 'Usuario', 'Rol', 'Acción', 'Descripción', 'Módulo']],
      body: bitacoraFiltrada.map(b => [
        new Date(b.fecha).toLocaleString(),
        b.usuario,
        b.rol,
        b.accion,
        b.descripcion,
        b.modulo,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [38, 71, 78] },
    });
    doc.save('bitacora_atp.pdf');
  };

  const generarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      bitacoraFiltrada.map(b => ({
        Fecha: new Date(b.fecha).toLocaleString(),
        Usuario: b.usuario,
        Rol: b.rol,
        Acción: b.accion,
        Descripción: b.descripcion,
        Módulo: b.modulo,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bitácora');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'bitacora_atp.xlsx');
  };

  const bitacoraFiltrada = bitacora.filter(b =>
    (b.usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (b.rol || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (b.accion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (b.modulo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>
        Bitácora - ATP Hospital María
      </h2>

      {mensajeError && (
        <Alert variant="danger" className="text-center">{mensajeError}</Alert>
      )}

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Desde:</Form.Label>
          <Form.Control type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label>Hasta:</Form.Label>
          <Form.Control type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label>Buscar:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Usuario, rol, acción, módulo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={3} className="d-flex align-items-end gap-2">
          <Button variant="primary" className="flex-fill" onClick={obtenerBitacora}>
            Filtrar
          </Button>
          <Button variant="success" className="flex-fill" onClick={generarPDF}>
            PDF
          </Button>
          <Button variant="warning" className="flex-fill text-white" onClick={generarExcel}>
            Excel
          </Button>
        </Col>
      </Row>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
          <Spinner animation="border" style={{ color: '#26474E' }} />
        </div>
      ) : (
        <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px' }}>
          <Table bordered hover responsive striped className="mb-0">
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#26474E', color: 'white', zIndex: 1 }}>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Descripción</th>
                <th>Módulo</th>
              </tr>
            </thead>
            <tbody>
              {bitacoraFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No se encontraron registros.</td>
                </tr>
              ) : (
                bitacoraFiltrada.map(b => (
                  <tr key={b.id}>
                    <td>{new Date(b.fecha).toLocaleString()}</td>
                    <td>{b.usuario}</td>
                    <td>{b.rol}</td>
                    <td>{b.accion}</td>
                    <td>{b.descripcion}</td>
                    <td>{b.modulo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default Bitacora;
