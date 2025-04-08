import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectForm = ({ editMode = false, projectData = null }) => {
  const initialState = projectData || {
    title: '',
    description: '',
    clientName: '',
    clientWebsite: '',
    sector: '',
    notes: ''
  };

  const [project, setProject] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (editMode && project.id) {
        // Actualizar proyecto existente
        response = await axios.put(`${API_URL}/projects/${project.id}`, project, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // Crear nuevo proyecto
        response = await axios.post(`${API_URL}/projects`, project, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Redireccionar a la página del proyecto
      navigate(`/projects/${response.data.project.id}`);
    } catch (err) {
      setError('Error al guardar el proyecto: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form-container">
      <h2>{editMode ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="title">Título del Proyecto *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            value={project.title}
            onChange={handleChange}
            required 
            placeholder="Ej. Sitio web para restaurante italiano"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea 
            id="description" 
            name="description" 
            value={project.description}
            onChange={handleChange}
            required 
            rows="4"
            placeholder="Describe brevemente el proyecto y sus objetivos"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Nombre del Cliente</label>
            <input 
              type="text" 
              id="clientName" 
              name="clientName" 
              value={project.clientName}
              onChange={handleChange}
              placeholder="Nombre del cliente o empresa"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="clientWebsite">Sitio Web del Cliente</label>
            <input 
              type="url" 
              id="clientWebsite" 
              name="clientWebsite" 
              value={project.clientWebsite}
              onChange={handleChange}
              placeholder="https://www.ejemplo.com"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="sector">Sector</label>
          <select 
            id="sector" 
            name="sector" 
            value={project.sector}
            onChange={handleChange}
          >
            <option value="">Seleccionar sector</option>
            <option value="restauracion">Restauración</option>
            <option value="salud">Salud y Bienestar</option>
            <option value="educacion">Educación</option>
            <option value="tecnologia">Tecnología</option>
            <option value="comercio">Comercio</option>
            <option value="servicios">Servicios Profesionales</option>
            <option value="turismo">Turismo</option>
            <option value="inmobiliaria">Inmobiliaria</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notas Adicionales</label>
          <textarea 
            id="notes" 
            name="notes" 
            value={project.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Información adicional relevante para el proyecto"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : editMode ? 'Actualizar Proyecto' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
