import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DocumentUploader = ({ projectId, onDocumentUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Verificar tipo de archivo
    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      setError('Solo se permiten archivos PDF o TXT');
      setFile(null);
      return;
    }
    
    // Verificar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar los 10MB');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  // Subir y analizar documento
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !projectId) {
      setError('Se requiere un archivo y un proyecto válido');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/advanced/projects/${projectId}/upload-document`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('Documento analizado y guardado correctamente');
      setFile(null);
      
      // Notificar al componente padre
      if (onDocumentUploaded && typeof onDocumentUploaded === 'function') {
        onDocumentUploaded(response.data.document);
      }
    } catch (err) {
      setError('Error al subir documento: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-uploader">
      <h3>Cargar Documento</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="document">Seleccionar Documento (PDF o TXT):</label>
          <input 
            type="file" 
            id="document" 
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <small>Tamaño máximo: 10MB</small>
        </div>
        
        {file && (
          <div className="file-info">
            <p><strong>Archivo seleccionado:</strong> {file.name}</p>
            <p><strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Tipo:</strong> {file.type}</p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={uploading || !file}
          >
            {uploading ? 'Subiendo y analizando...' : 'Subir y Analizar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;
