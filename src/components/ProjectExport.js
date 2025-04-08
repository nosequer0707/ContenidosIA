import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectExport = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Generar vista previa tipo landing
  const handleGeneratePreview = async () => {
    if (!project?.id) {
      setError('No hay proyecto seleccionado');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.get(`${API_URL}/export/project/${project.id}/preview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPreviewUrl(response.data.previewUrl);
      setSuccess('Vista previa generada correctamente');
    } catch (err) {
      setError('Error al generar vista previa: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Exportar proyecto como ZIP
  const handleExportZip = async () => {
    if (!project?.id) {
      setError('No hay proyecto seleccionado');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.get(`${API_URL}/export/project/${project.id}/zip`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setDownloadUrl(response.data.downloadUrl);
      setSuccess('Proyecto exportado correctamente');
    } catch (err) {
      setError('Error al exportar proyecto: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Exportar proyecto a HTML
  const handleExportHtml = async () => {
    if (!project?.id) {
      setError('No hay proyecto seleccionado');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.get(`${API_URL}/export/project/${project.id}/html`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess('Archivos HTML y CSS generados correctamente');
    } catch (err) {
      setError('Error al exportar a HTML: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return <div>No hay proyecto seleccionado</div>;
  }

  return (
    <div className="project-export">
      <h3>Exportación y Visualización</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="export-options">
        <div className="export-option">
          <h4>Vista Previa</h4>
          <p>Genera una vista previa tipo landing con el contenido del proyecto.</p>
          <button 
            className="btn-primary"
            onClick={handleGeneratePreview}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Vista Previa'}
          </button>
          
          {previewUrl && (
            <div className="preview-link">
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-link"
              >
                Abrir Vista Previa
              </a>
            </div>
          )}
        </div>
        
        <div className="export-option">
          <h4>Exportar como ZIP</h4>
          <p>Descarga un archivo ZIP con HTML, CSS y todos los recursos necesarios.</p>
          <button 
            className="btn-primary"
            onClick={handleExportZip}
            disabled={loading}
          >
            {loading ? 'Exportando...' : 'Exportar como ZIP'}
          </button>
          
          {downloadUrl && (
            <div className="download-link">
              <a 
                href={downloadUrl} 
                download
                className="btn-link"
              >
                Descargar ZIP
              </a>
            </div>
          )}
        </div>
        
        <div className="export-option">
          <h4>Exportar a HTML</h4>
          <p>Genera archivos HTML y CSS para implementación directa.</p>
          <button 
            className="btn-primary"
            onClick={handleExportHtml}
            disabled={loading}
          >
            {loading ? 'Exportando...' : 'Exportar a HTML'}
          </button>
        </div>
      </div>
      
      <div className="export-info">
        <h4>Información del Proyecto</h4>
        <div className="info-details">
          <p><strong>Título:</strong> {project.title}</p>
          <p><strong>Cliente:</strong> {project.clientName || 'No especificado'}</p>
          <p><strong>Estado:</strong> {
            project.status === 'active' ? 'Activo' : 
            project.status === 'completed' ? 'Completado' : 'Inviable'
          }</p>
          <p><strong>Secciones:</strong> {project.content?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectExport;
