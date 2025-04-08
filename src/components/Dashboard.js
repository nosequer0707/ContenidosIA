import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    nonViable: 0
  });
  const { user } = useAuth();

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Obtener proyectos del usuario
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setProjects(response.data.projects || []);
      
      // Calcular estadísticas
      if (response.data.projects) {
        const active = response.data.projects.filter(p => p.status === 'active').length;
        const completed = response.data.projects.filter(p => p.status === 'completed').length;
        const nonViable = response.data.projects.filter(p => p.status === 'non-viable').length;
        
        setStats({ active, completed, nonViable });
      }
      
      setError('');
    } catch (err) {
      setError('Error al cargar proyectos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard">
      <h2>Panel de Control</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Proyectos Activos</h3>
          <p className="stat-number">{stats.active}</p>
        </div>
        <div className="stat-card">
          <h3>Proyectos Completados</h3>
          <p className="stat-number">{stats.completed}</p>
        </div>
        <div className="stat-card">
          <h3>Proyectos Inviables</h3>
          <p className="stat-number">{stats.nonViable}</p>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <a href="/projects/new" className="btn-primary">Crear Nuevo Proyecto</a>
        <a href="/projects" className="btn-secondary">Ver Todos los Proyectos</a>
      </div>
      
      <div className="recent-projects">
        <h3>Proyectos Recientes</h3>
        {loading ? (
          <p>Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <p>No hay proyectos para mostrar.</p>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 4).map(project => (
              <div key={project.id} className={`project-card status-${project.status}`}>
                <h4>{project.title}</h4>
                <p className="project-description">{project.description.substring(0, 100)}...</p>
                <div className="project-meta">
                  <span className="project-date">Creado: {formatDate(project.created_at)}</span>
                  <span className="project-status">
                    {project.status === 'active' ? 'Activo' : 
                     project.status === 'completed' ? 'Completado' : 'Inviable'}
                  </span>
                </div>
                <div className="project-actions">
                  <a href={`/projects/${project.id}`} className="btn-small">Ver</a>
                  <a href={`/projects/${project.id}/edit`} className="btn-small">Editar</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
