import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterWithInvitation = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    token: ''
  });
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer token de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setUserData(prev => ({ ...prev, token }));
      validateToken(token);
    } else {
      setValidating(false);
      setError('No se proporcionó un token de invitación válido');
    }
  }, [location]);

  // Validar token de invitación
  const validateToken = async (token) => {
    try {
      setValidating(true);
      const response = await axios.get(`${API_URL}/invitations/validate/${token}`);
      setInvitation(response.data.invitation);
      setUserData(prev => ({ ...prev, email: response.data.invitation.email }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Token de invitación inválido o expirado');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar que las contraseñas coincidan
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Enviar solo los datos necesarios (sin confirmPassword)
      const { confirmPassword, ...registerData } = userData;
      await axios.post(`${API_URL}/auth/register`, registerData);
      setSuccess(true);
      
      // Redireccionar al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="card">
        <h2>Validando Invitación</h2>
        <p>Por favor espere mientras validamos su invitación...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="card">
        <h2>Error de Invitación</h2>
        <div className="error-message">{error}</div>
        <p>Por favor, contacte al administrador para obtener una nueva invitación.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card">
        <h2>Registro Exitoso</h2>
        <p>Su cuenta ha sido creada correctamente.</p>
        <p>Será redirigido a la página de inicio de sesión en unos segundos...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Registro de Usuario</h2>
      <p>Complete el formulario para crear su cuenta con la invitación recibida.</p>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={userData.email}
            disabled
            required 
          />
          <small>Este correo está asociado a su invitación y no puede ser modificado.</small>
        </div>
        <div className="form-group">
          <label htmlFor="name">Nombre Completo</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={userData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={userData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={userData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Completar Registro'}
        </button>
      </form>
    </div>
  );
};

export default RegisterWithInvitation;
