import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaBroom } from 'react-icons/fa';

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
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
    a.nombre_paciente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container fluid className="mt-3 px-3">
      <div className="bg-white rounded shadow-sm p-3 p-md-4">
        <h5 className="text-center fw-bold mb-3" style={{ color: '#26474E' }}>
          Lista de Atenciones
        </h5>

        {mensajeError && (
          <Alert variant="danger" className="text-center">{mensajeError}</Alert>
        )}

        {/* Filtro */}
        <Form className="mb-3">
          <Row className="g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre del paciente..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Control
                type="date"
                value={desde}
                onChange={e => setDesde(e.target.value)}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Control
                type="date"
                value={hasta}
                onChange={e => setHasta(e.target.value)}
              />
            </Col>
            <Col xs={12} md={2} className="d-grid gap-2">
              <Button variant="primary" onClick={obtenerAtenciones}>
                Filtrar
              </Button>
              <Button
                style={{ backgroundColor: '#ffc107', border: 'none' }}
                className="text-dark"
                onClick={() => {
                  setDesde('');
                  setHasta('');
                  setBusqueda('');
                  obtenerAtenciones();
                }}
              >
                <FaBroom /> Limpiar
              </Button>
              <Button
                style={{ backgroundColor: '#4CAF50', border: 'none' }}
                className="text-white"
                onClick={generarExcel}
              >
                Generar Excel
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Tabla */}
        {cargando ? (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" style={{ color: '#26474E' }} />
          </div>
        ) : (
          <div className="table-responsive">
            <Table bordered hover size="sm" className="mb-0 align-middle">
              <thead style={{ backgroundColor: '#26474E', color: 'white' }}>
                <tr className="text-center">
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Identidad</th>
                  <th>Edad</th>
                  <th>Especialidad</th>
                  <th>Procedencia</th>
                  <th>Motivo</th>
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
                      style={{ maxWidth: '150px', cursor: 'pointer' }}
                      className="text-truncate"
                      onClick={() => abrirModal('Motivo de la Atención', a.motivo_solicitud)}
                    >
                      {a.motivo_solicitud}
                    </td>
                    <td
                      style={{ maxWidth: '150px', cursor: 'pointer' }}
                      className="text-truncate"
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

        {/* Modal */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton style={{ backgroundColor: '#26474E', color: 'white' }}>
            <Modal.Title>{modalTitulo}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ whiteSpace: 'pre-wrap' }}>
            {modalContenido || 'Sin información disponible.'}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default ListaAtenciones;
