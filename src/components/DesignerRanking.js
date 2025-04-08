import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DesignerRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Cargar ranking al montar el componente
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRanking();
    }
  }, [user]);

  // Obtener ranking de diseñadores
  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/stats/ranking`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setRanking(response.data.ranking || []);
    } catch (err) {
      setError('Error al cargar ranking: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario es administrador
  if (user?.role !== 'admin') {
    return <div className="card">No tiene permisos para acceder a esta sección.</div>;
  }

  return (
    <div className="designer-ranking">
      <h3>Ranking de Diseñadores</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando ranking...</div>
      ) : ranking.length === 0 ? (
        <p>No hay diseñadores para mostrar en el ranking.</p>
      ) : (
        <div className="ranking-list">
          {ranking.map((designer, index) => (
            <div key={designer.id} className="ranking-item">
              <div className="ranking-position">#{index + 1}</div>
              <div className="ranking-info">
                <h4>{designer.name}</h4>
                <div className="ranking-stats">
                  <div className="ranking-stat">
                    <span className="label">Proyectos:</span>
                    <span className="value">{designer.projects.total}</span>
                  </div>
                  <div className="ranking-stat">
                    <span className="label">Completados:</span>
                    <span className="value">{designer.projects.completed}</span>
                  </div>
                  <div className="ranking-stat">
                    <span className="label">Tasa de finalización:</span>
                    <span className="value">{designer.projects.completionRate}%</span>
                  </div>
                </div>
                
                <div className="ranking-score">
                  <div className="score-label">Puntuación:</div>
                  <div className="score-value">{Math.round(designer.score)}</div>
                </div>
                
                <div className="ranking-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min(100, designer.projects.completionRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignerRanking;
