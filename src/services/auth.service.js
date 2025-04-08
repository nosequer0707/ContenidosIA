// Servicio de autenticación para el frontend
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar interceptor para incluir token en las peticiones
const setupAuthInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Registrar un nuevo usuario
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error en el servidor' };
  }
};

// Iniciar sesión
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error en el servidor' };
  }
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Verificar token y obtener información del usuario
const verifyToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data;
  } catch (error) {
    logout();
    throw error.response?.data || { message: 'Error en el servidor' };
  }
};

// Obtener usuario actual desde localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

// Verificar si el usuario está autenticado
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Verificar si el usuario es administrador
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

const AuthService = {
  setupAuthInterceptor,
  register,
  login,
  logout,
  verifyToken,
  getCurrentUser,
  isAuthenticated,
  isAdmin
};

export default AuthService;
