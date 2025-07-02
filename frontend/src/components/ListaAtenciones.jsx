import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Table, Spinner, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaAtenciones = () => {
  const { token } = useAuth();
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const obtenerAtenciones = async () => {
    setCargando(true);
    try {
      const params = {};
      if (desde && hasta) {
        params.desde = desde;
        params.hasta = hasta;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/atenciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setAtenciones(res.data);
    } catch (error) {
      setMensajeError(error.response?.data?.mensaje || 'Error al cargar atenciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerAtenciones();
  }, [token]);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Atenciones - ATP Hospital María', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [[
        'Fecha', 'Nombre', 'Identidad', 'Edad', 'Especialidad', 'Procedencia', 'Motivo', 'Oficial', 'Observaciones'
      ]],
      body: atencionesFiltradas.map(a => [
        a.fecha_solicitud,
        a.nombre_paciente,
        a.identidad_paciente,
        a.edad_paciente,
        a.especialidad,
        a.procedencia,
        a.motivo_solicitud,
        a.oficial,
        a.observaciones
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [47, 79, 161] },
    });
    doc.save('reporte_atenciones.pdf');
  };

  const generarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      atencionesFiltradas.map(a => ({
        Fecha: a.fecha_solicitud,
        'Nombre Paciente': a.nombre_paciente,
        Identidad: a.identidad_paciente,
        Edad: a.edad_paciente,
        Especialidad: a.especialidad,
        Procedencia: a.procedencia,
        Motivo: a.motivo_solicitud,
        'Oficial Responsable': a.oficial,
        Observaciones: a.observaciones
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atenciones');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reporte_atenciones.xlsx');
  };

  const atencionesFiltradas = atenciones.filter(a =>
    a.nombre_paciente.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: '#2f4fa1' }}>
        Lista de Atenciones
      </h2>

      {mensajeError && (
        <Alert variant="danger" className="text-center">
          {mensajeError}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Desde:</Form.Label>
          <Form.Control
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Hasta:</Form.Label>
          <Form.Control
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Buscar por nombre:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre del paciente"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={3} className="d-flex align-items-end flex-wrap gap-2">
          <Button variant="primary" className="flex-fill" onClick={obtenerAtenciones}>
            Filtrar
          </Button>
          <Button variant="success" className="flex-fill" onClick={generarPDF}>
            Generar PDF
          </Button>
          <Button variant="warning" className="flex-fill text-white" onClick={generarExcel}>
            Generar Excel
          </Button>
        </Col>
      </Row>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" role="status" style={{ color: '#2f4fa1' }} />
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover striped className="shadow-sm">
            <thead style={{ backgroundColor: '#2f4fa1', color: 'white' }}>
              <tr>
                <th>Fecha</th>
                <th>Nombre Paciente</th>
                <th>Identidad</th>
                <th>Edad</th>
                <th>Especialidad</th>
                <th>Procedencia</th>
                <th>Motivo</th>
                <th>Oficial Responsable</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {atencionesFiltradas.map(a => (
                <tr key={a.id}>
                  <td>{a.fecha_solicitud}</td>
                  <td>{a.nombre_paciente}</td>
                  <td>{a.identidad_paciente}</td>
                  <td>{a.edad_paciente}</td>
                  <td>{a.especialidad}</td>
                  <td>{a.procedencia}</td>
                  <td>{a.motivo_solicitud}</td>
                  <td>{a.oficial}</td>
                  <td>{a.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ListaAtenciones;
