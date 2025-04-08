import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Bloquear/desbloquear usuario
  const handleToggleUserBlock = async (userId, isBlocked) => {
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/admin/users/${userId}/block`, 
        { blocked: !isBlocked },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Actualizar lista de usuarios
      fetchUsers();
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Cambiar rol de usuario
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!window.confirm(`¿Está seguro de cambiar el rol de este usuario a ${newRole === 'admin' ? 'Administrador' : 'Usuario normal'}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/admin/users/${userId}/role`, 
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Actualizar lista de usuarios
      fetchUsers();
    } catch (err) {
      setError('Error al cambiar rol de usuario: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Verificar si el usuario es administrador
  if (user?.role !== 'admin') {
    return <div className="card">No tiene permisos para acceder a esta sección.</div>;
  }

  return (
    <div className="user-management">
      <h2>Gestión de Usuarios</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Proyectos</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.blocked ? 'user-blocked' : ''}>
                  <td data-label="Nombre">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Rol">{user.role === 'admin' ? 'Administrador' : 'Diseñador'}</td>
                  <td data-label="Estado">
                    <span className={`status-badge ${user.blocked ? 'status-blocked' : 'status-active'}`}>
                      {user.blocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td data-label="Proyectos">{user.projectCount || 0}</td>
                  <td data-label="Registro">{formatDate(user.created_at)}</td>
                  <td data-label="Acciones">
                    <button 
                      className={`btn-small ${user.blocked ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleToggleUserBlock(user.id, user.blocked)}
                      disabled={user.role === 'admin' && user.id === user.id}
                    >
                      {user.blocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button 
                      className="btn-small"
                      onClick={() => handleChangeRole(user.id, user.role)}
                      disabled={user.id === user.id}
                    >
                      {user.role === 'admin' ? 'Hacer Diseñador' : 'Hacer Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
