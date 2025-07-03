import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Form,
  Button,
  Table,
  Alert,
  Row,
  Col,
  Spinner,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaLock,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from 'react-icons/fa';

const AdminPanel = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    rol: 'oficial_atp',
  });

  const [modalEditar, setModalEditar] = useState(false);
  const [modalContrasena, setModalContrasena] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/usuarios`,
        nuevoUsuario,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/${endpoint}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      obtenerUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar usuario');
      setTimeout(() => setError(null), 3000);
    }
  };

  const abrirModalEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalEliminar(true);
  };

  const eliminarUsuario = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/usuarios/${usuarioSeleccionado.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalEliminar(false);
      setMensaje('Usuario eliminado correctamente');
      obtenerUsuarios();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al eliminar usuario');
      setTimeout(() => setError(null), 3000);
    }
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/${usuarioSeleccionado.id}`,
        usuarioSeleccionado,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalEditar(false);
      obtenerUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al editar usuario');
    }
  };

  const abrirModalContrasena = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevaContrasena('');
    setModalContrasena(true);
  };

  const cambiarContrasena = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/cambiar-contrasena/${usuarioSeleccionado.id}`,
        { contrasena: nuevaContrasena },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalContrasena(false);
      setMensaje('Contraseña actualizada');
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar contraseña');
      setTimeout(() => setError(null), 3000);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container fluid className="mt-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>
        Panel Administrativo - Usuarios ATP
      </h2>

      {mensaje && <Alert variant="success" className="text-center">{mensaje}</Alert>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {/* Formulario de creación de usuario */}
      <Form onSubmit={crearUsuario} className="mb-4 p-3 border rounded shadow-sm">
        <Row className="g-2">
          <Col xs={12} md={3}>
            <Form.Control
              type="text"
              placeholder="Nombre"
              name="nombre"
              value={nuevoUsuario.nombre}
              onChange={handleChange}
              required
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Control
              type="text"
              placeholder="Usuario"
              name="usuario"
              value={nuevoUsuario.usuario}
              onChange={handleChange}
              required
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              name="contrasena"
              value={nuevoUsuario.contrasena}
              onChange={handleChange}
              required
            />
          </Col>
          <Col xs={8} md={2}>
            <Form.Select
              name="rol"
              value={nuevoUsuario.rol}
              onChange={handleChange}
              required
            >
              <option value="administrador">Administrador</option>
              <option value="oficial_atp">Oficial ATP</option>
              <option value="voluntario">Voluntario</option>
            </Form.Select>
          </Col>
          <Col xs={4} md={1}>
            <Button type="submit" variant="primary" className="w-100">
              Crear
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Buscador */}
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Buscar usuario o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </InputGroup>

      {/* Tabla */}
      {cargando ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" style={{ color: '#26474E' }} />
        </div>
      ) : (
        <div style={{ maxHeight: '270px', overflowY: 'auto' }}>
          <div className="table-responsive">
            <Table bordered hover striped responsive className="shadow-sm">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#26474E', color: 'white', zIndex: 1 }}>
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
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.usuario}</td>
                    <td>{u.rol}</td>
                    <td>{u.activo ? 'Sí' : 'No'}</td>
                    <td className="d-flex flex-wrap gap-1">
                      <Button size="sm" variant="warning" onClick={() => abrirModalEditar(u)}>
                        <FaEdit />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => abrirModalEliminar(u)}>
                        <FaTrash />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => abrirModalContrasena(u)}>
                        <FaLock />
                      </Button>
                      <Button
                        size="sm"
                        variant={u.activo ? 'success' : 'outline-success'}
                        onClick={() => toggleActivo(u.id, u.activo)}
                      >
                        {u.activo ? <FaToggleOn /> : <FaToggleOff />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      <Modal show={modalEliminar} onHide={() => setModalEliminar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar al usuario{' '}
          <strong>{usuarioSeleccionado?.nombre}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEliminar(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarUsuario}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar */}
      <Modal show={modalEditar} onHide={() => setModalEditar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={usuarioSeleccionado?.nombre || ''}
                onChange={(e) =>
                  setUsuarioSeleccionado({ ...usuarioSeleccionado, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={usuarioSeleccionado?.usuario || ''}
                onChange={(e) =>
                  setUsuarioSeleccionado({ ...usuarioSeleccionado, usuario: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={usuarioSeleccionado?.rol || ''}
                onChange={(e) =>
                  setUsuarioSeleccionado({ ...usuarioSeleccionado, rol: e.target.value })
                }
              >
                <option value="administrador">Administrador</option>
                <option value="oficial_atp">Oficial ATP</option>
                <option value="voluntario">Voluntario</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarEdicion}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Cambiar Contraseña */}
      <Modal show={modalContrasena} onHide={() => setModalContrasena(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nueva Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalContrasena(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={cambiarContrasena}>
            Cambiar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;
