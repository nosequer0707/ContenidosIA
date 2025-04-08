import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="card project-card">
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <div className="project-meta">
        <span className="project-date">Creado: {new Date(project.createdAt).toLocaleDateString()}</span>
        <span className={`project-status status-${project.status}`}>{project.status}</span>
      </div>
      <div className="project-actions">
        <button className="btn-primary">Editar</button>
        <button className="btn-secondary">Ver</button>
        <button className="btn-danger">Eliminar</button>
      </div>
    </div>
  );
};

export default ProjectCard;
