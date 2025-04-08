import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebSearch from './WebSearch';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectResearch = ({ projectId }) => {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Cargar investigación al montar el componente
  useEffect(() => {
    if (projectId) {
      fetchResearch();
    }
  }, [projectId]);

  // Obtener investigación guardada para el proyecto
  const fetchResearch = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/search/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setResearch(response.data.research || []);
    } catch (err) {
      setError('Error al cargar la investigación: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cuando se guardan nuevos resultados
  const handleResultsSaved = (newResearch) => {
    fetchResearch();
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="project-research">
      <h2>Investigación del Proyecto</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <WebSearch projectId={projectId} onResultsSaved={handleResultsSaved} />
      
      <div className="research-history">
        <h3>Historial de Investigación</h3>
        
        {loading ? (
          <div className="loading">Cargando investigación...</div>
        ) : research.length === 0 ? (
          <div className="empty-state">
            <p>No hay investigación guardada para este proyecto.</p>
            <p>Utilice la búsqueda web para recopilar información.</p>
          </div>
        ) : (
          <div className="research-list">
            {research.map((item, index) => (
              <div key={index} className="research-item card">
                <div className="research-header">
                  <h4>Búsqueda: "{item.query}"</h4>
                  <span className="research-date">{formatDate(item.created_at)}</span>
                </div>
                
                {item.scraped_content && (
                  <div className="research-content">
                    <h5>
                      <a href={item.scraped_content.url} target="_blank" rel="noopener noreferrer">
                        {item.scraped_content.title}
                      </a>
                    </h5>
                    
                    {item.scraped_content.description && (
                      <p className="content-description">{item.scraped_content.description}</p>
                    )}
                    
                    <div className="content-preview">
                      {item.scraped_content.content.substring(0, 200)}...
                    </div>
                    
                    <button 
                      className="btn-small"
                      onClick={() => {
                        // Aquí se podría implementar una vista detallada del contenido
                        console.log('Ver contenido completo', item);
                      }}
                    >
                      Ver Contenido Completo
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectResearch;
