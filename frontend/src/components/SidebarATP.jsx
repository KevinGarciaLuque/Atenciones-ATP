import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUserPlus,
  FaList,
  FaTools,
  FaClipboardList,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const SidebarATP = ({ setSidebarExpanded }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
      setSidebarExpanded?.(false);
    } else {
      setIsOpen(true);
      setSidebarExpanded?.(true);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setSidebarExpanded?.(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '15px',
          left: isOpen ? '230px' : '15px',
          zIndex: 1100,
          background: '#26474E',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'left 0.3s'
        }}
      >
        {isOpen ? <FaChevronLeft /> : <FaBars />}
      </button>

      <div
        style={{
          width: isOpen ? '220px' : '0',
          minHeight: '100vh',
          backgroundColor: '#26474E',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
          padding: isOpen ? '20px 10px' : '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          overflow: 'hidden',
          transition: 'width 0.3s, padding 0.3s'
        }}
      >
        {isOpen && (
          <>
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
                style={{ transition: 'background 0.3s', cursor: 'pointer' }}
                onMouseOver={e => (e.currentTarget.style.background = '#4D7B82')}
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
          </>
        )}
      </div>
    </>
  );
};

export default SidebarATP;
