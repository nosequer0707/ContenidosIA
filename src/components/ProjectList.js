import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sort: 'newest'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar proyectos al montar el componente o cambiar filtros
  useEffect(() => {
    fetchProjects();
  }, [filters.status, filters.sort]);

  // Obtener proyectos del usuario
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects`, {
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          sort: filters.sort
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let filteredProjects = response.data.projects || [];
      
      // Filtrar por búsqueda si hay texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.title.toLowerCase().includes(searchLower) || 
          project.description.toLowerCase().includes(searchLower) ||
          (project.clientName && project.clientName.toLowerCase().includes(searchLower))
        );
      }
      
      setProjects(filteredProjects);
      setError('');
    } catch (err) {
      setError('Error al cargar proyectos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si es búsqueda, esperar a que el usuario termine de escribir
    if (name === 'search') {
      return;
    }
  };

  // Manejar búsqueda con debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchProjects();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters.search]);

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Manejar eliminación de proyecto
  const handleDelete = async (projectId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      fetchProjects();
    } catch (err) {
      setError('Error al eliminar el proyecto: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="project-list">
      <div className="list-header">
        <h2>Mis Proyectos</h2>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/projects/new')}
        >
          Crear Nuevo Proyecto
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status">Estado:</label>
          <select 
            id="status" 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="completed">Completados</option>
            <option value="non-viable">Inviables</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sort">Ordenar por:</label>
          <select 
            id="sort" 
            name="sort" 
            value={filters.sort}
            onChange={handleFilterChange}
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="alphabetical">Alfabético</option>
          </select>
        </div>
        
        <div className="filter-group search">
          <input 
            type="text" 
            name="search" 
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar proyectos..."
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron proyectos.</p>
          {filters.status !== 'all' || filters.search ? (
            <p>Prueba a cambiar los filtros de búsqueda.</p>
          ) : (
            <p>¡Crea tu primer proyecto para comenzar!</p>
          )}
        </div>
      ) : (
        <div className="projects-table-container">
          <table className="responsive-table projects-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className={`status-${project.status}`}>
                  <td data-label="Título">
                    <a href={`/projects/${project.id}`} className="project-title">
                      {project.title}
                    </a>
                  </td>
                  <td data-label="Estado">
                    <span className={`status-badge status-${project.status}`}>
                      {project.status === 'active' ? 'Activo' : 
                       project.status === 'completed' ? 'Completado' : 'Inviable'}
                    </span>
                  </td>
                  <td data-label="Cliente">{project.clientName || '-'}</td>
                  <td data-label="Creado">{formatDate(project.created_at)}</td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button 
                        className="btn-small" 
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Ver
                      </button>
                      <button 
                        className="btn-small" 
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-small btn-danger" 
                        onClick={() => handleDelete(project.id)}
                      >
                        Eliminar
                      </button>
                    </div>
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

export default ProjectList;
