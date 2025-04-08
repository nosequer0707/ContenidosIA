import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HourlyRateConfig = () => {
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Cargar diseñadores al montar el componente
  useEffect(() => {
    if (isAdmin) {
      fetchDesigners();
    }
  }, [isAdmin]);

  // Obtener diseñadores
  const fetchDesigners = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Filtrar solo diseñadores (no administradores)
      const designersList = response.data.users.filter(user => user.role !== 'admin') || [];
      setDesigners(designersList);
    } catch (err) {
      setError('Error al cargar diseñadores: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Cargar tarifa actual al seleccionar diseñador
  useEffect(() => {
    if (selectedDesigner) {
      fetchDesignerRate(selectedDesigner);
    } else {
      setHourlyRate('');
    }
  }, [selectedDesigner]);

  // Obtener tarifa de un diseñador
  const fetchDesignerRate = async (userId) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/advanced/users/${userId}/hourly-rate`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setHourlyRate(response.data.rate.toString());
    } catch (err) {
      console.error('Error al cargar tarifa:', err);
      setHourlyRate('0');
    } finally {
      setLoading(false);
    }
  };

  // Establecer tarifa por hora
  const handleSetRate = async (e) => {
    e.preventDefault();
    
    if (!selectedDesigner || hourlyRate === '' || isNaN(hourlyRate) || parseFloat(hourlyRate) < 0) {
      setError('Por favor seleccione un diseñador e ingrese una tarifa válida');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await axios.post(`${API_URL}/advanced/users/hourly-rate`, {
        userId: selectedDesigner,
        hourlyRate: parseFloat(hourlyRate)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess('Tarifa por hora configurada correctamente');
    } catch (err) {
      setError('Error al configurar tarifa: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return <div className="card">No tiene permisos para acceder a esta sección.</div>;
  }

  return (
    <div className="hourly-rate-config">
      <h3>Configuración de Coste/Hora por Diseñador</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {loading && !saving ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <form onSubmit={handleSetRate}>
          <div className="form-group">
            <label htmlFor="designer">Seleccionar Diseñador:</label>
            <select 
              id="designer" 
              value={selectedDesigner}
              onChange={(e) => setSelectedDesigner(e.target.value)}
              disabled={saving}
              required
            >
              <option value="">-- Seleccione un diseñador --</option>
              {designers.map(designer => (
                <option key={designer.id} value={designer.id}>
                  {designer.name} ({designer.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="hourlyRate">Tarifa por Hora (€):</label>
            <input 
              type="number" 
              id="hourlyRate" 
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Ingrese la tarifa por hora"
              disabled={saving || !selectedDesigner}
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving || !selectedDesigner || hourlyRate === ''}
            >
              {saving ? 'Guardando...' : 'Guardar Tarifa'}
            </button>
          </div>
        </form>
      )}
      
      {designers.length > 0 && (
        <div className="rates-summary">
          <h4>Resumen de Tarifas</h4>
          <p>Esta configuración permite calcular el coste de los proyectos basado en el tiempo dedicado por cada diseñador.</p>
          <p>Las tarifas configuradas se utilizarán para generar informes de costes y rentabilidad.</p>
        </div>
      )}
    </div>
  );
};

export default HourlyRateConfig;
