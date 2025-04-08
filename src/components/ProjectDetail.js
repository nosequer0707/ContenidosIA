import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar proyecto al montar el componente
  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Obtener detalles del proyecto
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setProject(response.data.project);
      setError('');
    } catch (err) {
      setError('Error al cargar el proyecto: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Manejar eliminación de proyecto
  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      navigate('/projects');
    } catch (err) {
      setError('Error al eliminar el proyecto: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/projects/${projectId}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      fetchProject();
    } catch (err) {
      setError('Error al cambiar el estado del proyecto: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  if (loading && !project) {
    return <div className="loading">Cargando proyecto...</div>;
  }

  if (error && !project) {
    return <div className="error-container">{error}</div>;
  }

  if (!project) {
    return <div className="not-found">Proyecto no encontrado</div>;
  }

  return (
    <div className="project-detail">
      <div className="project-header">
        <h2>{project.title}</h2>
        <div className={`status-badge status-${project.status}`}>
          {project.status === 'active' ? 'Activo' : 
           project.status === 'completed' ? 'Completado' : 'Inviable'}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="project-meta">
        <div className="meta-item">
          <span className="meta-label">Creado:</span>
          <span className="meta-value">{formatDate(project.created_at)}</span>
        </div>
        {project.updated_at && (
          <div className="meta-item">
            <span className="meta-label">Última actualización:</span>
            <span className="meta-value">{formatDate(project.updated_at)}</span>
          </div>
        )}
        {project.clientName && (
          <div className="meta-item">
            <span className="meta-label">Cliente:</span>
            <span className="meta-value">{project.clientName}</span>
          </div>
        )}
        {project.sector && (
          <div className="meta-item">
            <span className="meta-label">Sector:</span>
            <span className="meta-value">{project.sector}</span>
          </div>
        )}
      </div>
      
      <div className="project-content">
        <div className="content-section">
          <h3>Descripción</h3>
          <p>{project.description}</p>
        </div>
        
        {project.clientWebsite && (
          <div className="content-section">
            <h3>Sitio Web del Cliente</h3>
            <a href={project.clientWebsite} target="_blank" rel="noopener noreferrer">
              {project.clientWebsite}
            </a>
          </div>
        )}
        
        {project.notes && (
          <div className="content-section">
            <h3>Notas Adicionales</h3>
            <p>{project.notes}</p>
          </div>
        )}
        
        {project.content && (
          <div className="content-section">
            <h3>Contenido Generado</h3>
            <div className="generated-content">
              {project.content}
            </div>
          </div>
        )}
      </div>
      
      <div className="project-actions">
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/projects')}
        >
          Volver a Proyectos
        </button>
        <button 
          className="btn-primary" 
          onClick={() => navigate(`/projects/${projectId}/edit`)}
        >
          Editar Proyecto
        </button>
        {project.status === 'active' && (
          <button 
            className="btn-success" 
            onClick={() => handleStatusChange('completed')}
          >
            Marcar como Completado
          </button>
        )}
        {project.status === 'active' && (
          <button 
            className="btn-warning" 
            onClick={() => handleStatusChange('non-viable')}
          >
            Marcar como Inviable
          </button>
        )}
        <button 
          className="btn-danger" 
          onClick={handleDelete}
        >
          Eliminar Proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
