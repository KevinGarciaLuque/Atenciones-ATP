import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUserPlus,
  FaList,
  FaTools,
  FaClipboardList,
  FaSignOutAlt
} from 'react-icons/fa';

const SidebarATP = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkStyle = {
    transition: 'background 0.3s',
    cursor: 'pointer'
  };

  const linkHoverColor = '#4D7B82';

  return (
    <div
      style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: '#26474E',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: 1000
      }}
    >
      <h5 className="text-center fw-bold mb-4">ATP Hospital María</h5>

      {[
        { to: '/dashboard', icon: <FaTachometerAlt />, text: 'Dashboard' },
        { to: '/registrar', icon: <FaUserPlus />, text: 'Registrar Atención' },
        { to: '/atenciones', icon: <FaList />, text: 'Ver Atenciones' },
        ...(usuario?.rol === 'administrador'
          ? [{ to: '/admin', icon: <FaTools />, text: 'Panel Admin' }]
          : []),
        { to: '/bitacora', icon: <FaClipboardList />, text: 'Bitácora' }
      ].map(({ to, icon, text }) => (
        <Link
          key={to}
          to={to}
          className="text-decoration-none text-white d-flex align-items-center gap-2 p-2 rounded"
          style={linkStyle}
          onMouseOver={e => (e.currentTarget.style.background = linkHoverColor)}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          {icon} {text}
        </Link>
      ))}

      <button
        onClick={handleLogout}
        className="btn mt-auto d-flex align-items-center gap-2 justify-content-center text-white"
        style={{
          backgroundColor: '#4D7B82',
          border: 'none',
          transition: 'background 0.3s',
          cursor: 'pointer'
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#77A9B1')}
        onMouseOut={e => (e.currentTarget.style.background = '#4D7B82')}
      >
        <FaSignOutAlt /> Cerrar Sesión
      </button>
    </div>
  );
};

export default SidebarATP;
