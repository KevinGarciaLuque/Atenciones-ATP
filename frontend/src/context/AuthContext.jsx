import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (usuarioData, tokenData) => {
    setUsuario(usuarioData);
    setToken(tokenData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
