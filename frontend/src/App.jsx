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

  return (
    <div style={{ display: 'flex' }}>
      {usuario && <SidebarATP />}
      <div
        style={{
          flex: 1,
          marginLeft: usuario ? '220px' : '0',
          padding: '20px',
          backgroundColor: '#E1EDF2',
          minHeight: '100vh'
        }}
      >
        <Routes>
          <Route
            path="/"
            element={usuario ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {usuario && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
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
