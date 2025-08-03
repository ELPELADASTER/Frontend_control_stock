

import React from 'react';

export interface Articulo {
  id: number;
  nombre: string;
  cantidad: number;
  utilizados: number;
  disponibles: number;
  simbolo?: string;
  created_at?: string;
  updated_at?: string;
  empresa?: string;
}


interface ListaArticulosProps {
  articulos: Articulo[];
  onEditar: (articulo: Articulo) => void;
  onEliminar: (id: number) => void;
}



const ListaArticulos: React.FC<ListaArticulosProps> = ({ articulos, onEditar, onEliminar }) => (
  <div className="card shadow border-0 mt-4">
    <div className="card-header bg-white border-bottom-0 pb-0">
      <h3 className="mb-0 fw-bold text-primary">Listado de artículos</h3>
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th className="d-none d-sm-table-cell">Cantidad inicial</th>
              <th className="d-none d-md-table-cell">Utilizados</th>
              <th>Disponibles</th>
              <th className="d-none d-lg-table-cell">Última modificación</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map(articulo => (
              <tr key={articulo.id} className="align-middle">
                <td>
                  <span className="fs-3 bg-light d-inline-flex align-items-center justify-content-center rounded-circle border shadow-sm" style={{width: 56, height: 56}}>
                    {articulo.simbolo || '📦'}
                  </span>
                </td>
                <td className="fw-semibold text-truncate" style={{maxWidth: 180}}>{articulo.nombre}</td>
                <td className="d-none d-sm-table-cell">
                  <span className="badge bg-secondary rounded-pill px-3 py-2 fs-6">{articulo.cantidad}</span>
                </td>
                <td className="d-none d-md-table-cell">
                  <span className="badge bg-info text-dark rounded-pill px-3 py-2 fs-6">{articulo.utilizados}</span>
                </td>
                <td>
                  <span className={`badge rounded-pill px-3 py-2 fs-6 ${articulo.disponibles <= 2 ? 'bg-danger' : articulo.disponibles >= 10 ? 'bg-success' : 'bg-warning text-dark'}`}>{articulo.disponibles}</span>
                </td>
                <td className="text-secondary small d-none d-lg-table-cell">
                  {articulo.updated_at ? new Date(articulo.updated_at).toLocaleString() : '-'}
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-outline-primary btn-sm me-2 rounded-circle"
                    onClick={() => onEditar(articulo)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm rounded-circle"
                    onClick={() => onEliminar(articulo.id)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ListaArticulos;
