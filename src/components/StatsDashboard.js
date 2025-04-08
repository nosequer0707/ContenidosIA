import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatsDashboard = ({ userId = null }) => {
  const [stats, setStats] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchStats();
    if (isAdmin) {
      fetchSystemStats();
    }
  }, [userId, isAdmin]);

  // Obtener estadísticas del usuario
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const url = userId 
        ? `${API_URL}/stats/user/${userId}` 
        : `${API_URL}/stats/user`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setStats(response.data.stats);
    } catch (err) {
      setError('Error al cargar estadísticas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas del sistema (solo admin)
  const fetchSystemStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/system`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSystemStats(response.data.stats);
    } catch (err) {
      console.error('Error al cargar estadísticas del sistema:', err);
      // No mostrar error para no sobrecargar la interfaz
    }
  };

  // Renderizar gráfico de barras simple
  const renderBarChart = (data, title) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item.projects));
    
    return (
      <div className="chart bar-chart">
        <h4>{title}</h4>
        <div className="chart-container">
          {data.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-label">{`${item.month} ${item.year}`}</div>
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${(item.projects / maxValue) * 100}%`,
                    backgroundColor: `hsl(${210 + (index * 30)}, 70%, 50%)`
                  }}
                >
                  <span className="chart-value">{item.projects}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar gráfico circular simple
  const renderPieChart = (data, title) => {
    if (!data) return null;
    
    const total = data.total || 1; // Evitar división por cero
    const segments = [
      { label: 'Activos', value: data.active, color: '#4CAF50' },
      { label: 'Completados', value: data.completed, color: '#2196F3' },
      { label: 'Inviables', value: data.nonViable, color: '#F44336' }
    ];
    
    let cumulativePercent = 0;
    
    return (
      <div className="chart pie-chart">
        <h4>{title}</h4>
        <div className="chart-container">
          <div className="pie-container">
            <svg viewBox="0 0 100 100">
              {segments.map((segment, index) => {
                const percent = (segment.value / total) * 100;
                if (percent === 0) return null;
                
                const startPercent = cumulativePercent;
                cumulativePercent += percent;
                
                const startX = Math.cos(2 * Math.PI * startPercent / 100);
                const startY = Math.sin(2 * Math.PI * startPercent / 100);
                const endX = Math.cos(2 * Math.PI * cumulativePercent / 100);
                const endY = Math.sin(2 * Math.PI * cumulativePercent / 100);
                
                const largeArcFlag = percent > 50 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${50 + 50 * startX} ${50 + 50 * startY}`,
                  `A 50 50 0 ${largeArcFlag} 1 ${50 + 50 * endX} ${50 + 50 * endY}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path 
                    key={index} 
                    d={pathData} 
                    fill={segment.color}
                  />
                );
              })}
            </svg>
          </div>
          <div className="chart-legend">
            {segments.map((segment, index) => (
              <div key={index} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: segment.color }}></span>
                <span className="legend-label">{segment.label}: {segment.value} ({Math.round((segment.value / total) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stats-dashboard">
      <h2>Estadísticas {userId && userId !== user?.id ? 'del Diseñador' : 'Personales'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando estadísticas...</div>
      ) : stats ? (
        <div className="stats-container">
          <div className="stats-section">
            <h3>Resumen de Proyectos</h3>
            <div className="stats-cards">
              <div className="stat-card">
                <h4>Total de Proyectos</h4>
                <p className="stat-number">{stats.projects.total}</p>
              </div>
              <div className="stat-card">
                <h4>Proyectos Activos</h4>
                <p className="stat-number">{stats.projects.active}</p>
              </div>
              <div className="stat-card">
                <h4>Proyectos Completados</h4>
                <p className="stat-number">{stats.projects.completed}</p>
              </div>
              <div className="stat-card">
                <h4>Tasa de Finalización</h4>
                <p className="stat-number">{stats.projects.completionRate}%</p>
              </div>
            </div>
            
            {renderPieChart(stats.projects, 'Distribución de Proyectos')}
          </div>
          
          <div className="stats-section">
            <h3>Actividad</h3>
            <div className="stats-cards">
              <div className="stat-card">
                <h4>Búsquedas Realizadas</h4>
                <p className="stat-number">{stats.activity.searches}</p>
              </div>
              <div className="stat-card">
                <h4>Contenidos Generados</h4>
                <p className="stat-number">{stats.activity.contentGenerated}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No hay estadísticas disponibles.</p>
      )}
      
      {isAdmin && systemStats && (
        <div className="system-stats">
          <h3>Estadísticas del Sistema</h3>
          
          <div className="stats-cards">
            <div className="stat-card">
              <h4>Total de Usuarios</h4>
              <p className="stat-number">{systemStats.users.total}</p>
            </div>
            <div className="stat-card">
              <h4>Total de Proyectos</h4>
              <p className="stat-number">{systemStats.projects.total}</p>
            </div>
            <div className="stat-card">
              <h4>Tasa de Finalización</h4>
              <p className="stat-number">{systemStats.projects.completionRate}%</p>
            </div>
          </div>
          
          {renderBarChart(systemStats.activity.monthly, 'Proyectos por Mes')}
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
