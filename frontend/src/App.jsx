import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RegistrarAtencion from './components/RegistrarAtencion';
import ListaAtenciones from './components/ListaAtenciones';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Bitacora from './components/Bitacora';
import SidebarATP from './components/SidebarATP';
import { useAuth } from './context/AuthContext';

function App() {
  const { usuario } = useAuth();

  // Estado global para expandir/colapsar Sidebar
  const [sidebarExpanded, setSidebarExpanded] = useState(window.innerWidth > 768);

  return (
    <div style={{ display: 'flex' }}>
      {usuario && (
        <SidebarATP setSidebarExpanded={setSidebarExpanded} />
      )}
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#E1EDF2',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          marginLeft: usuario ? (sidebarExpanded ? '220px' : '0') : '0'
        }}
      >
        <Routes>
          <Route
            path="/"
            element={usuario ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {usuario && (
            <>
              <Route path="/dashboard" element={<Dashboard sidebarExpanded={sidebarExpanded} />} />
              <Route path="/registrar" element={<RegistrarAtencion />} />
              <Route path="/atenciones" element={<ListaAtenciones />} />

              {usuario.rol === 'administrador' && (
                <>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/bitacora" element={<Bitacora />} />
                </>
              )}
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
