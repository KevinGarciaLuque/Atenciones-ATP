import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaUserPlus, FaList, FaUser, FaTools } from 'react-icons/fa';

const NavbarATP = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: '#26474E' }} variant="dark" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to={usuario ? "/dashboard" : "/"} className="fw-bold">
          ATP Hospital María
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-atp" />
        <Navbar.Collapse id="navbar-atp">
          {usuario ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/registrar">
                  <FaUserPlus className="mb-1" /> Registrar Atención
                </Nav.Link>
                <Nav.Link as={Link} to="/atenciones">
                  <FaList className="mb-1" /> Ver Atenciones
                </Nav.Link>
                {usuario.rol === 'administrador' && (
                  <Nav.Link as={Link} to="/admin">
                    <FaTools className="mb-1" /> Panel Admin
                  </Nav.Link>
                )}
              </Nav>
              <Nav className="align-items-center">
                <Navbar.Text className="me-3 text-white fw-semibold">
                  <FaUser className="mb-1" /> {usuario.nombre} ({usuario.rol})
                </Navbar.Text>
                <Button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#4D7B82',
                    borderColor: '#4D7B82',
                    transition: 'background 0.3s, border 0.3s, color 0.3s'
                  }}
                  onMouseOver={e => {
                    e.target.style.backgroundColor = '#77A9B1';
                    e.target.style.borderColor = '#77A9B1';
                    e.target.style.color = '#26474E';
                  }}
                  onMouseOut={e => {
                    e.target.style.backgroundColor = '#4D7B82';
                    e.target.style.borderColor = '#4D7B82';
                    e.target.style.color = 'white';
                  }}
                >
                  <FaSignOutAlt className="mb-1" /> Cerrar Sesión
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">
                Iniciar Sesión
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarATP;
