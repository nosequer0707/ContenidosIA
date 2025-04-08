import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InvitationManager = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newInvitation, setNewInvitation] = useState({ email: '', expiresIn: 7 });
  const { user } = useAuth();

  // Cargar invitaciones al montar el componente
  useEffect(() => {
    fetchInvitations();
  }, []);

  // Obtener todas las invitaciones
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/invitations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInvitations(response.data.invitations);
      setError('');
    } catch (err) {
      setError('Error al cargar invitaciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewInvitation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear nueva invitación
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_URL}/invitations`, newInvitation, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNewInvitation({ email: '', expiresIn: 7 });
      fetchInvitations();
      setError('');
    } catch (err) {
      setError('Error al crear invitación: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar invitación
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta invitación?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/invitations/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchInvitations();
      setError('');
    } catch (err) {
      setError('Error al eliminar invitación: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Reenviar invitación
  const handleResend = async (id) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/invitations/${id}/resend`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchInvitations();
      setError('');
    } catch (err) {
      setError('Error al reenviar invitación: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Verificar si el usuario es administrador
  if (user?.role !== 'admin') {
    return <div className="card">No tiene permisos para acceder a esta sección.</div>;
  }

  return (
    <div className="invitation-manager">
      <h2>Gestión de Invitaciones</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="card">
        <h3>Nueva Invitación</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={newInvitation.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiresIn">Días de validez</label>
            <select 
              id="expiresIn" 
              name="expiresIn" 
              value={newInvitation.expiresIn}
              onChange={handleChange}
            >
              <option value="1">1 día</option>
              <option value="3">3 días</option>
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Invitación'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h3>Historial de Invitaciones</h3>
        {loading ? (
          <p>Cargando invitaciones...</p>
        ) : invitations.length === 0 ? (
          <p>No hay invitaciones para mostrar.</p>
        ) : (
          <div className="table-container">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th>Expira</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(invitation => (
                  <tr key={invitation.id}>
                    <td data-label="Email">{invitation.email}</td>
                    <td data-label="Estado">
                      <span className={`status-badge status-${invitation.status}`}>
                        {invitation.status === 'pending' ? 'Pendiente' : 
                         invitation.status === 'accepted' ? 'Aceptada' : 'Cancelada'}
                      </span>
                    </td>
                    <td data-label="Creada">{formatDate(invitation.created_at)}</td>
                    <td data-label="Expira">{formatDate(invitation.expires_at)}</td>
                    <td data-label="Acciones">
                      {invitation.status === 'pending' && (
                        <>
                          <button 
                            className="btn-small" 
                            onClick={() => handleResend(invitation.id)}
                            disabled={loading}
                          >
                            Reenviar
                          </button>
                          <button 
                            className="btn-small btn-danger" 
                            onClick={() => handleDelete(invitation.id)}
                            disabled={loading}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManager;
