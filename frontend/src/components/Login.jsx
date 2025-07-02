import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { usuario, contrasena });
      login(res.data.usuario, res.data.token);

      setMensaje('¡Inicio de sesión exitoso!');
      setTipoMensaje('success');

      setTimeout(() => {
        setMensaje(null);
        navigate('/dashboard'); // O '/registrar' según prefieras
      }, 1000);
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
      setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
      setTipoMensaje('danger');
      setTimeout(() => setMensaje(null), 3000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="text-center mb-4">
                <FaSignInAlt className="mb-1" /> Iniciar Sesión
              </h3>

              {mensaje && (
                <Alert variant={tipoMensaje} className="d-flex align-items-center">
                  {tipoMensaje === 'success' ? (
                    <FaCheckCircle className="me-2" />
                  ) : (
                    <FaTimesCircle className="me-2" />
                  )}
                  <span>{mensaje}</span>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={contrasena}
                    onChange={e => setContrasena(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg" disabled={cargando}>
                    {cargando ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" /> Iniciando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
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

export default Login;
