import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RegistrarAtencion = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    fecha_solicitud: '',
    nombre_paciente: '',
    identidad_paciente: '',
    edad_paciente: '',
    especialidad: '',
    procedencia: '',
    motivo_solicitud: '',
    observaciones: ''
  });

  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('success');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/atenciones`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Atención registrada correctamente');
      setTipoMensaje('success');
      setForm({
        fecha_solicitud: '',
        nombre_paciente: '',
        identidad_paciente: '',
        edad_paciente: '',
        especialidad: '',
        procedencia: '',
        motivo_solicitud: '',
        observaciones: ''
      });
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al registrar');
      setTipoMensaje('danger');
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="text-center mb-4">Registrar Atención</h3>
              {mensaje && (
                <Alert variant={tipoMensaje} className="d-flex align-items-center">
                  {tipoMensaje === 'success' ? (
                    <FaCheckCircle className="me-2" />
                  ) : (
                    <FaTimesCircle className="me-2" />
                  )}
                  {mensaje}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Solicitud</Form.Label>
                  <Form.Control type="date" name="fecha_solicitud" value={form.fecha_solicitud} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Paciente</Form.Label>
                  <Form.Control type="text" name="nombre_paciente" value={form.nombre_paciente} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>No. de Identidad del Paciente</Form.Label>
                  <Form.Control type="text" name="identidad_paciente" value={form.identidad_paciente} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Edad del Paciente</Form.Label>
                  <Form.Control type="number" name="edad_paciente" value={form.edad_paciente} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Select name="especialidad" value={form.especialidad} onChange={handleChange} required>
                    <option value="">Selecciona una especialidad</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Cardiología intervencionista">Cardiología intervencionista</option>
                    <option value="Cirugía cardiovascular">Cirugía cardiovascular</option>
                    <option value="Cirugía pediátrica">Cirugía pediátrica</option>
                    <option value="Cirugía plástica reconstructiva">Cirugía plástica reconstructiva</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Endocrinología">Endocrinología</option>
                    <option value="Gastroenterología">Gastroenterología</option>
                    <option value="Inmunología y alergias">Inmunología y alergias</option>
                    <option value="Nefrología">Nefrología</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Otorrinolaringología">Otorrinolaringología</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Procedencia</Form.Label>
                  <Form.Control type="text" name="procedencia" value={form.procedencia} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Motivo de Solicitud</Form.Label>
                  <Form.Control as="textarea" rows={3} name="motivo_solicitud" value={form.motivo_solicitud} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control as="textarea" rows={2} name="observaciones" value={form.observaciones} onChange={handleChange} />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg">
                    Registrar Atención
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrarAtencion;
