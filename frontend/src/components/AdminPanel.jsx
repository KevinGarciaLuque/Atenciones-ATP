import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button, Table, Alert, Row, Col, Spinner } from 'react-bootstrap';

const AdminPanel = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    rol: 'oficial_atp',
  });

  const obtenerUsuarios = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, [token]);

  const handleChange = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/usuarios`, nuevoUsuario, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje('Usuario creado correctamente');
      setNuevoUsuario({
        nombre: '',
        usuario: '',
        contrasena: '',
        rol: 'oficial_atp',
      });
      obtenerUsuarios();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear usuario');
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleActivo = async (id, activo) => {
    try {
      const endpoint = activo ? 'desactivar' : 'activar';
      await axios.put(`${import.meta.env.VITE_API_URL}/usuarios/${endpoint}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar usuario');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>
        Panel Administrativo - Crear Oficiales ATP
      </h2>

      {mensaje && <Alert variant="success" className="text-center">{mensaje}</Alert>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Form onSubmit={crearUsuario} className="mb-4 p-3 border rounded shadow-sm">
        <Row className="g-3">
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Nombre"
              name="nombre"
              value={nuevoUsuario.nombre}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Usuario"
              name="usuario"
              value={nuevoUsuario.usuario}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              name="contrasena"
              value={nuevoUsuario.contrasena}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={2}>
            <Form.Select
              name="rol"
              value={nuevoUsuario.rol}
              onChange={handleChange}
              required
            >
              <option value="oficial_atp">Oficial ATP</option>
              <option value="voluntario">Voluntario</option>
            </Form.Select>
          </Col>
          <Col md={1}>
            <Button type="submit" variant="primary" className="w-100">
              Crear
            </Button>
          </Col>
        </Row>
      </Form>

      {cargando ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" style={{ color: '#26474E' }} />
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover striped className="shadow-sm">
            <thead style={{ backgroundColor: '#26474E', color: 'white' }}>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.usuario}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? 'Sí' : 'No'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant={u.activo ? 'danger' : 'success'}
                      onClick={() => toggleActivo(u.id, u.activo)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default AdminPanel;
