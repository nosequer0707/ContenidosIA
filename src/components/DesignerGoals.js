import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DesignerGoals = ({ userId = null }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOwnGoals = !userId || userId === user?.id;

  // Cargar objetivos al montar el componente
  useEffect(() => {
    fetchGoals();
  }, [userId]);

  // Obtener objetivos del diseñador
  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');

      const url = userId 
        ? `${API_URL}/stats/goals/${userId}` 
        : `${API_URL}/stats/goals`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setGoals(response.data.goals || []);
    } catch (err) {
      setError('Error al cargar objetivos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Establecer nuevo objetivo
  const handleSetGoal = async (e) => {
    e.preventDefault();
    
    if (!newGoal || isNaN(newGoal) || parseInt(newGoal) <= 0) {
      setError('Por favor ingrese un valor válido para el objetivo');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await axios.post(`${API_URL}/stats/goals`, {
        userId: userId || user.id,
        goal: parseInt(newGoal)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNewGoal('');
      fetchGoals();
    } catch (err) {
      setError('Error al establecer objetivo: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Formatear nombre del mes
  const formatMonth = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  // Verificar si es el mes actual
  const isCurrentMonth = (month, year) => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  return (
    <div className="designer-goals">
      <h3>Objetivos Mensuales</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {isAdmin && (
        <div className="goal-form">
          <form onSubmit={handleSetGoal}>
            <div className="form-group">
              <label htmlFor="newGoal">Establecer objetivo para el mes actual:</label>
              <div className="input-group">
                <input 
                  type="number" 
                  id="newGoal" 
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  min="1"
                  placeholder="Número de proyectos"
                  disabled={saving}
                />
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving || !newGoal}
                >
                  {saving ? 'Guardando...' : 'Establecer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Cargando objetivos...</div>
      ) : goals.length === 0 ? (
        <p>No hay objetivos establecidos.</p>
      ) : (
        <div className="goals-list">
          {goals.map((goal, index) => (
            <div key={index} className={`goal-item ${isCurrentMonth(goal.month, goal.year) ? 'current-month' : ''}`}>
              <div className="goal-header">
                <h4>{formatMonth(goal.month)} {goal.year}</h4>
                <div className="goal-status">
                  <span className={`status-badge ${goal.progressPercentage >= 100 ? 'status-completed' : 'status-active'}`}>
                    {goal.progressPercentage >= 100 ? 'Completado' : 'En progreso'}
                  </span>
                </div>
              </div>
              
              <div className="goal-details">
                <div className="goal-values">
                  <div className="goal-value">
                    <span className="label">Objetivo:</span>
                    <span className="value">{goal.goal_value} proyectos</span>
                  </div>
                  <div className="goal-value">
                    <span className="label">Progreso:</span>
                    <span className="value">{goal.progress} proyectos ({goal.progressPercentage}%)</span>
                  </div>
                </div>
                
                <div className="goal-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
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

export default DesignerGoals;
