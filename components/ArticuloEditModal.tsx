import React, { useState } from 'react';
import { Articulo } from './ListaArticulos';

const EMPRESAS = ['Telecom', 'Pago Online'];
interface ArticuloEditModalProps {
  articulo: Articulo | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { id: number; nombre: string; cantidad: number; utilizados: number; imagen?: File | null; empresa: string }) => void;
}

const ArticuloEditModal: React.FC<ArticuloEditModalProps> = ({ articulo, open, onClose, onSave }) => {
  const [nombre, setNombre] = useState<string>(articulo?.nombre || '');
  const [cantidad, setCantidad] = useState<number>(articulo?.cantidad || 0);
  const [utilizados, setUtilizados] = useState<number>(articulo?.utilizados || 0);
  const [imagen, setImagen] = useState<File | null>(null);
  const [empresa, setEmpresa] = useState<string>(articulo?.empresa || 'Telecom');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setNombre(articulo?.nombre || '');
    setCantidad(articulo?.cantidad || 0);
    setUtilizados(articulo?.utilizados || 0);
    setImagen(null);
    setEmpresa(articulo?.empresa || 'Telecom');
  }, [articulo]);

  if (!open || !articulo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0 || utilizados < 0 || utilizados > cantidad) {
      setError('Verifica que el nombre no esté vacío, la cantidad sea mayor a 0 y la cantidad utilizada sea válida.');
      return;
    }
    onSave({ id: articulo.id, nombre, cantidad, utilizados, imagen, empresa });
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.4)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar artículo</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Empresa</label>
                <select className="form-select" value={empresa} onChange={e => setEmpresa(e.target.value)}>
                  {EMPRESAS.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="nombre-edit" className="form-label">Nombre</label>
                <input
                  id="nombre-edit"
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cantidad-edit" className="form-label">Cantidad</label>
                <input
                  id="cantidad-edit"
                  type="number"
                  value={cantidad}
                  onChange={e => setCantidad(Number(e.target.value))}
                  required
                  min={1}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="utilizados-edit" className="form-label">Cantidad utilizada</label>
                <input
                  id="utilizados-edit"
                  type="number"
                  value={utilizados}
                  onChange={e => setUtilizados(Number(e.target.value))}
                  min={0}
                  max={cantidad}
                  className="form-control"
                />
                <div className="form-text">No puede ser mayor que la cantidad inicial.</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad disponible</label>
                <input
                  type="number"
                  value={cantidad - utilizados}
                  readOnly
                  className="form-control-plaintext"
                  style={{fontWeight: 'bold'}}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen-edit" className="form-label">Imagen (opcional)</label>
                <input
                  id="imagen-edit"
                  type="file"
                  accept="image/*"
                  onChange={e => setImagen(e.target.files?.[0] || null)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticuloEditModal;
