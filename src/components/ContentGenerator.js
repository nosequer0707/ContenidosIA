import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ContentGenerator = ({ projectId, research }) => {
  const [sections, setSections] = useState([
    { id: 'intro', name: 'Introducción', selected: true },
    { id: 'about', name: 'Acerca de', selected: false },
    { id: 'services', name: 'Servicios', selected: false },
    { id: 'features', name: 'Características', selected: false },
    { id: 'benefits', name: 'Beneficios', selected: false },
    { id: 'testimonials', name: 'Testimonios', selected: false },
    { id: 'faq', name: 'Preguntas Frecuentes', selected: false },
    { id: 'contact', name: 'Contacto', selected: false }
  ]);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState({});
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Cargar contenido guardado al montar el componente
  useEffect(() => {
    if (projectId) {
      fetchProjectContent();
    }
  }, [projectId]);

  // Obtener contenido guardado para el proyecto
  const fetchProjectContent = async () => {
    try {
      setContentLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/ai/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSavedContent(response.data.content || []);
    } catch (err) {
      setError('Error al cargar contenido: ' + (err.response?.data?.message || err.message));
    } finally {
      setContentLoading(false);
    }
  };

  // Seleccionar sección
  const handleSectionSelect = (sectionId) => {
    setSections(sections.map(section => ({
      ...section,
      selected: section.id === sectionId
    })));
  };

  // Generar contenido con IA
  const handleGenerateContent = async () => {
    const selectedSection = sections.find(section => section.selected);
    if (!selectedSection || !prompt.trim()) return;

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_URL}/ai/generate`, {
        projectId,
        section: selectedSection.name,
        prompt
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setGeneratedContent({
        ...generatedContent,
        [selectedSection.id]: response.data.content
      });

      // Actualizar la lista de contenido guardado
      fetchProjectContent();
    } catch (err) {
      setError('Error al generar contenido: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar contenido guardado
  const handleUpdateContent = async (contentId, newContent) => {
    try {
      setLoading(true);
      setError('');

      await axios.put(`${API_URL}/ai/content/${contentId}`, {
        content: newContent
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Actualizar la lista de contenido guardado
      fetchProjectContent();
    } catch (err) {
      setError('Error al actualizar contenido: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar contenido guardado
  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este contenido?')) return;

    try {
      setLoading(true);
      setError('');

      await axios.delete(`${API_URL}/ai/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Actualizar la lista de contenido guardado
      fetchProjectContent();
    } catch (err) {
      setError('Error al eliminar contenido: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-generator">
      <h3>Generador de Contenido con IA</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="generator-container">
        <div className="sections-selector">
          <h4>Secciones</h4>
          <ul className="section-list">
            {sections.map(section => (
              <li 
                key={section.id} 
                className={section.selected ? 'selected' : ''}
                onClick={() => handleSectionSelect(section.id)}
              >
                {section.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="content-area">
          <div className="prompt-container">
            <h4>Instrucciones para la IA</h4>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe lo que quieres que la IA genere para esta sección..."
              rows="4"
              disabled={loading}
            ></textarea>
            <button 
              className="btn-primary"
              onClick={handleGenerateContent}
              disabled={loading || !prompt.trim()}
            >
              {loading ? 'Generando...' : 'Generar Contenido'}
            </button>
          </div>
          
          {contentLoading ? (
            <div className="loading">Cargando contenido guardado...</div>
          ) : (
            <div className="saved-content">
              <h4>Contenido Generado</h4>
              
              {savedContent.length === 0 ? (
                <p>No hay contenido generado para este proyecto.</p>
              ) : (
                <div className="content-list">
                  {savedContent.map((content, index) => (
                    <div key={content.id} className="content-item card">
                      <div className="content-header">
                        <h5>{content.section}</h5>
                        <div className="content-actions">
                          <button 
                            className="btn-small"
                            onClick={() => {
                              // Aquí se podría implementar la edición del contenido
                              console.log('Editar contenido', content);
                            }}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div 
                        className="content-preview"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      ></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
