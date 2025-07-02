import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Table, Spinner, Alert, Form, Button, Row, Col, Modal } from 'react-bootstrap';
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

  const [modalShow, setModalShow] = useState(false);
  const [modalContenido, setModalContenido] = useState('');
  const [modalTitulo, setModalTitulo] = useState('');

  const abrirModal = (titulo, contenido) => {
    setModalTitulo(titulo);
    setModalContenido(contenido);
    setModalShow(true);
  };

  const formatearFechaHora = (fechaString) => {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${fecha.toLocaleDateString('es-ES', opcionesFecha)} ${fecha.toLocaleTimeString('es-ES', opcionesHora)}`;
  };

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

  const generarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      atencionesFiltradas.map(a => ({
        Fecha: formatearFechaHora(a.fecha_solicitud),
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
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>Lista de Atenciones</h2>

      {mensajeError && <Alert variant="danger" className="text-center">{mensajeError}</Alert>}

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
  <Button
    className="flex-fill text-white"
    style={{
      backgroundColor: '#4CAF50', // verde profesional
      border: 'none',
      transition: 'background 0.3s'
    }}
    onMouseOver={e => e.currentTarget.style.backgroundColor = '#45A049'} // verde más oscuro en hover
    onMouseOut={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
    onClick={generarExcel}
  >
    Generar Excel
  </Button>
</Col>

      </Row>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" style={{ color: '#26474E' }} />
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover striped className="shadow-sm">
            <thead style={{ backgroundColor: '#26474E', color: 'white' }}>
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
                  <td>{formatearFechaHora(a.fecha_solicitud)}</td>
                  <td>{a.nombre_paciente}</td>
                  <td>{a.identidad_paciente}</td>
                  <td>{a.edad_paciente}</td>
                  <td>{a.especialidad}</td>
                  <td>{a.procedencia}</td>
                  <td
                    style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => abrirModal('Motivo de la Atención', a.motivo_solicitud)}
                  >
                    {a.motivo_solicitud}
                  </td>
                  <td>{a.oficial}</td>
                  <td
                    style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => abrirModal('Observaciones', a.observaciones)}
                  >
                    {a.observaciones}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#26474E', color: 'white' }}>
          <Modal.Title>{modalTitulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            wordWrap: 'break-word',
            fontSize: '1rem',
            textAlign: 'justify',
            padding: '20px',
            lineHeight: '1.6'
          }}
        >
          {modalContenido || 'Sin información disponible.'}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setModalShow(false)}
            style={{ backgroundColor: '#4D7B82', border: 'none' }}
            onMouseOver={e => { e.target.style.backgroundColor = '#77A9B1'; }}
            onMouseOut={e => { e.target.style.backgroundColor = '#4D7B82'; }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListaAtenciones;
