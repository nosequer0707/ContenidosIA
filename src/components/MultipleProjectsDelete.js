import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MultipleProjectsDelete = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Obtener proyectos del usuario o todos los proyectos si es admin
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const url = user?.role === 'admin' 
        ? `${API_URL}/projects/all` 
        : `${API_URL}/projects`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setProjects(response.data.projects || []);
    } catch (err) {
      setError('Error al cargar proyectos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de proyecto
  const handleSelectProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  // Seleccionar todos los proyectos
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(project => project.id));
    }
  };

  // Eliminar proyectos seleccionados
  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) {
      setError('No hay proyectos seleccionados para eliminar');
      return;
    }

    if (!window.confirm(`¿Está seguro de que desea eliminar ${selectedProjects.length} proyectos? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await axios.post(`${API_URL}/advanced/projects/delete-multiple`, 
        { projectIds: selectedProjects },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess(`${selectedProjects.length} proyectos eliminados correctamente`);
      setSelectedProjects([]);
      fetchProjects();
    } catch (err) {
      setError('Error al eliminar proyectos: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="multiple-projects-delete">
      <h3>Eliminación Múltiple de Proyectos</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="actions-bar">
        <button 
          className="btn-secondary"
          onClick={handleSelectAll}
          disabled={loading || deleting || projects.length === 0}
        >
          {selectedProjects.length === projects.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
        </button>
        <button 
          className="btn-danger"
          onClick={handleDeleteSelected}
          disabled={loading || deleting || selectedProjects.length === 0}
        >
          {deleting ? 'Eliminando...' : `Eliminar Seleccionados (${selectedProjects.length})`}
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <p>No hay proyectos disponibles.</p>
      ) : (
        <div className="table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Seleccionar</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Creado</th>
                {user?.role === 'admin' && <th>Diseñador</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className={`status-${project.status}`}>
                  <td data-label="Seleccionar">
                    <input 
                      type="checkbox" 
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      disabled={deleting}
                    />
                  </td>
                  <td data-label="Título">{project.title}</td>
                  <td data-label="Estado">
                    <span className={`status-badge status-${project.status}`}>
                      {project.status === 'active' ? 'Activo' : 
                       project.status === 'completed' ? 'Completado' : 'Inviable'}
                    </span>
                  </td>
                  <td data-label="Cliente">{project.clientName || '-'}</td>
                  <td data-label="Creado">{formatDate(project.created_at)}</td>
                  {user?.role === 'admin' && (
                    <td data-label="Diseñador">{project.user?.name || 'Desconocido'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MultipleProjectsDelete;
