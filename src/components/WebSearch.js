import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const WebSearch = ({ projectId, onResultsSaved }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [scrapedContent, setScrapedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Realizar búsqueda web
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearchResults([]);
      setSelectedUrl('');
      setScrapedContent(null);

      const response = await axios.post(`${API_URL}/search/web`, 
        { query, limit: 10 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSearchResults(response.data.results);
    } catch (err) {
      setError('Error al realizar la búsqueda: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Realizar scraping de una URL
  const handleScrape = async (url) => {
    try {
      setScraping(true);
      setError('');
      setScrapedContent(null);
      setSelectedUrl(url);

      const response = await axios.post(`${API_URL}/search/scrape`, 
        { url },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setScrapedContent(response.data.content);
    } catch (err) {
      setError('Error al realizar scraping: ' + (err.response?.data?.message || err.message));
    } finally {
      setScraping(false);
    }
  };

  // Guardar resultados de búsqueda y scraping
  const handleSaveResearch = async () => {
    if (!scrapedContent) return;

    try {
      setSaving(true);
      setError('');

      await axios.post(`${API_URL}/search/save`, 
        {
          projectId,
          query,
          searchResults,
          scrapedContent
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Notificar al componente padre que se guardaron los resultados
      if (onResultsSaved) {
        onResultsSaved({
          query,
          url: scrapedContent.url,
          title: scrapedContent.title
        });
      }

      // Limpiar el formulario
      setQuery('');
      setSearchResults([]);
      setSelectedUrl('');
      setScrapedContent(null);
    } catch (err) {
      setError('Error al guardar la investigación: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="web-search">
      <h3>Búsqueda Web y Scraping</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingrese términos de búsqueda..."
            disabled={loading || scraping || saving}
            required
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || scraping || saving || !query.trim()}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>
      
      {loading ? (
        <div className="loading">Realizando búsqueda...</div>
      ) : searchResults.length > 0 ? (
        <div className="search-results">
          <h4>Resultados de Búsqueda</h4>
          <ul className="results-list">
            {searchResults.map((result, index) => (
              <li key={index} className={selectedUrl === result.url ? 'selected' : ''}>
                <div className="result-header">
                  <h5>{result.title}</h5>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-url">
                    {result.url}
                  </a>
                </div>
                <p className="result-snippet">{result.snippet}</p>
                <button 
                  className="btn-secondary"
                  onClick={() => handleScrape(result.url)}
                  disabled={scraping || saving}
                >
                  {scraping && selectedUrl === result.url ? 'Extrayendo...' : 'Extraer Contenido'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : query && !loading ? (
        <div className="no-results">No se encontraron resultados para "{query}"</div>
      ) : null}
      
      {scrapedContent && (
        <div className="scraped-content">
          <h4>Contenido Extraído de {scrapedContent.title}</h4>
          
          <div className="content-preview">
            <h5>Título</h5>
            <p>{scrapedContent.title}</p>
            
            <h5>Descripción</h5>
            <p>{scrapedContent.description || 'No se encontró descripción'}</p>
            
            <h5>Contenido</h5>
            <div className="content-text">
              {scrapedContent.content.length > 500 
                ? scrapedContent.content.substring(0, 500) + '...' 
                : scrapedContent.content}
            </div>
            
            {scrapedContent.images.length > 0 && (
              <div className="content-images">
                <h5>Imágenes ({scrapedContent.images.length})</h5>
                <div className="images-grid">
                  {scrapedContent.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={image.alt} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              className="btn-primary save-button"
              onClick={handleSaveResearch}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Investigación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSearch;
