import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface ArticuloFormProps {
  onArticuloCreado: () => void;
  empresa: string;
  onEmpresaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const EMPRESAS = ['Telecom', 'Pago Online'];
const ArticuloForm: React.FC<ArticuloFormProps> = ({ onArticuloCreado, empresa, onEmpresaChange }) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [imagen, setImagen] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError('Por favor ingresa un nombre y una cantidad mayor a 0.');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('cantidad', cantidad.toString());
    if (imagen) formData.append('imagen', imagen);
    try {
      formData.append('empresa', empresa);
      const res = await fetch('http://localhost:4000/api/articulos', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear el artículo');
        return;
      }
      setNombre('');
      setCantidad(0);
      setImagen(null);
      onArticuloCreado();
    } catch (err) {
      setError('Error de red al crear el artículo');
    }
  };

  return (
    <div className="card shadow-lg border-0 mx-auto" style={{maxWidth: 500, background: '#f8f9fa'}}>
      <div className="card-header bg-primary text-white text-center rounded-top">
        <h2 className="card-title mb-0">Agregar artículo</h2>
      </div>
      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label htmlFor="empresa" className="form-label fw-semibold">Empresa</label>
            <select id="empresa" className="form-select rounded-pill shadow-sm" value={empresa} onChange={onEmpresaChange} required>
              {EMPRESAS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="nombre" className="form-label fw-semibold">Nombre</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Martillo de carpintero"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              className="form-control rounded-pill shadow-sm"
            />
          </div>
          <div className="col-12">
            <label htmlFor="cantidad" className="form-label fw-semibold">Cantidad inicial</label>
            <input
              id="cantidad"
              type="number"
              placeholder="Ej: 10"
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              required
              min={1}
              className="form-control rounded-pill shadow-sm"
            />
          </div>
          <div className="col-12">
            <label htmlFor="imagen" className="form-label fw-semibold">Imagen (opcional)</label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              onChange={e => setImagen(e.target.files?.[0] || null)}
              className="form-control rounded-pill shadow-sm"
            />
          </div>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow">
              <PlusCircle className="me-2" />
              Guardar artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticuloForm;
