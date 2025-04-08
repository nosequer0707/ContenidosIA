import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SendProjectCopy = ({ project }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Enviar copia del proyecto por correo
  const handleSendCopy = async (e) => {
    e.preventDefault();
    
    if (!email || !project?.id) {
      setError('Se requiere una dirección de correo válida');
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      await axios.post(`${API_URL}/advanced/projects/send-copy`, 
        { 
          projectId: project.id,
          email 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess(`Proyecto enviado correctamente a ${email}`);
      setEmail('');
    } catch (err) {
      setError('Error al enviar proyecto: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  if (!project) {
    return <div>No hay proyecto seleccionado</div>;
  }

  return (
    <div className="send-project-copy">
      <h3>Enviar Copia del Proyecto</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSendCopy}>
        <div className="form-group">
          <label htmlFor="email">Dirección de Correo:</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese la dirección de correo"
            required
            disabled={sending}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={sending || !email}
          >
            {sending ? 'Enviando...' : 'Enviar Copia'}
          </button>
        </div>
      </form>
      
      <div className="project-preview">
        <h4>Vista Previa del Proyecto</h4>
        <div className="preview-details">
          <p><strong>Título:</strong> {project.title}</p>
          <p><strong>Cliente:</strong> {project.clientName || 'No especificado'}</p>
          <p><strong>Estado:</strong> {
            project.status === 'active' ? 'Activo' : 
            project.status === 'completed' ? 'Completado' : 'Inviable'
          }</p>
        </div>
      </div>
    </div>
  );
};

export default SendProjectCopy;
