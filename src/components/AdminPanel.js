import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    nonViableProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError('No tiene permisos para acceder a esta sección');
    } else {
      fetchData();
    }
  }, [user]);

  // Cargar datos del panel de administración
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener usuarios
      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Obtener proyectos
      const projectsResponse = await axios.get(`${API_URL}/projects/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Obtener estadísticas
      const statsResponse = await axios.get(`${API_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUsers(usersResponse.data.users || []);
      setProjects(projectsResponse.data.projects || []);
      setStats(statsResponse.data.stats || {
        totalUsers: usersResponse.data.users?.length || 0,
        totalProjects: projectsResponse.data.projects?.length || 0,
        activeProjects: projectsResponse.data.projects?.filter(p => p.status === 'active').length || 0,
        completedProjects: projectsResponse.data.projects?.filter(p => p.status === 'completed').length || 0,
        nonViableProjects: projectsResponse.data.projects?.filter(p => p.status === 'non-viable').length || 0
      });
    } catch (err) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Bloquear/desbloquear usuario
  const handleToggleUserBlock = async (userId, isBlocked) => {
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/users/${userId}/block`, 
        { blocked: !isBlocked },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Actualizar lista de usuarios
      setUsers(users.map(user => 
        user.id === userId ? { ...user, blocked: !isBlocked } : user
      ));
      
      setError('');
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Marcar proyecto como inviable
  const handleMarkNonViable = async (projectId) => {
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/projects/${projectId}/status`, 
        { status: 'non-viable' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Actualizar lista de proyectos
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, status: 'non-viable' } : project
      ));
      
      // Actualizar estadísticas
      setStats({
        ...stats,
        activeProjects: stats.activeProjects - 1,
        nonViableProjects: stats.nonViableProjects + 1
      });
      
      setError('');
    } catch (err) {
      setError('Error al actualizar proyecto: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Si el usuario no es administrador, mostrar mensaje de error
  if (user && user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="error-message">
          No tiene permisos para acceder a esta sección. Esta área está reservada para administradores.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Proyectos
        </button>
        <button 
          className={activeTab === 'invitations' ? 'active' : ''}
          onClick={() => setActiveTab('invitations')}
        >
          Invitaciones
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <div className="admin-content">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Usuarios</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h3>Proyectos Totales</h3>
                  <p className="stat-number">{stats.totalProjects}</p>
                </div>
                <div className="stat-card">
                  <h3>Proyectos Activos</h3>
                  <p className="stat-number">{stats.activeProjects}</p>
                </div>
                <div className="stat-card">
                  <h3>Proyectos Completados</h3>
                  <p className="stat-number">{stats.completedProjects}</p>
                </div>
                <div className="stat-card">
                  <h3>Proyectos Inviables</h3>
                  <p className="stat-number">{stats.nonViableProjects}</p>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Actividad Reciente</h3>
                {/* Aquí se podría mostrar un registro de actividad reciente */}
                <p>Funcionalidad de registro de actividad en desarrollo.</p>
              </div>
            </div>
          )}
          
          {/* Gestión de Usuarios */}
          {activeTab === 'users' && (
            <div className="admin-users">
              <h3>Gestión de Usuarios</h3>
              
              {users.length === 0 ? (
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
                            >
                              {user.blocked ? 'Desbloquear' : 'Bloquear'}
                            </button>
                            <button 
                              className="btn-small"
                              onClick={() => {
                                // Aquí se podría implementar la edición de usuario
                                console.log('Editar usuario', user);
                              }}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Gestión de Proyectos */}
          {activeTab === 'projects' && (
            <div className="admin-projects">
              <h3>Gestión de Proyectos</h3>
              
              {projects.length === 0 ? (
                <p>No hay proyectos registrados.</p>
              ) : (
                <div className="table-container">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Diseñador</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr key={project.id} className={`status-${project.status}`}>
                          <td data-label="Título">{project.title}</td>
                          <td data-label="Diseñador">{project.user?.name || 'Desconocido'}</td>
                          <td data-label="Estado">
                            <span className={`status-badge status-${project.status}`}>
                              {project.status === 'active' ? 'Activo' : 
                               project.status === 'completed' ? 'Completado' : 'Inviable'}
                            </span>
                          </td>
                          <td data-label="Cliente">{project.clientName || '-'}</td>
                          <td data-label="Creado">{formatDate(project.created_at)}</td>
                          <td data-label="Acciones">
                            <button 
                              className="btn-small"
                              onClick={() => {
                                // Aquí se podría implementar la vista detallada
                                console.log('Ver proyecto', project);
                              }}
                            >
                              Ver
                            </button>
                            {project.status === 'active' && (
                              <button 
                                className="btn-small btn-warning"
                                onClick={() => handleMarkNonViable(project.id)}
                              >
                                Marcar Inviable
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Gestión de Invitaciones */}
          {activeTab === 'invitations' && (
            <div className="admin-invitations">
              <h3>Gestión de Invitaciones</h3>
              {/* Aquí se incluiría el componente InvitationManager */}
              <p>Componente de gestión de invitaciones cargando...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
