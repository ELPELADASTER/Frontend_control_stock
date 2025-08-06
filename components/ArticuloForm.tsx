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
  const [simbolo, setSimbolo] = useState('📦');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError('Por favor ingresa un nombre y una cantidad mayor a 0.');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, cantidad, simbolo, empresa }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear el artículo');
        return;
      }
      setNombre('');
      setCantidad(0);
      setSimbolo('📦');
      onArticuloCreado();
    } catch (err) {
      setError('Error de red al crear el artículo');
    }
  };

  return (
    <div className="card shadow-lg border-0 mx-auto" style={{background: '#f8f9fa'}}>
      <div className="card-header bg-primary text-white text-center rounded-top">
        <h2 className="card-title mb-0 fs-4 fs-md-3">Agregar artículo</h2>
      </div>
      <div className="card-body p-3 p-md-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12 col-sm-6">
            <label htmlFor="empresa" className="form-label fw-semibold">Empresa</label>
            <select id="empresa" className="form-select rounded-pill shadow-sm" value={empresa} onChange={onEmpresaChange} required>
              {EMPRESAS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-6">
            <label htmlFor="simbolo" className="form-label fw-semibold">Símbolo</label>
            <select
              id="simbolo"
              value={simbolo}
              onChange={e => setSimbolo(e.target.value)}
              className="form-select rounded-pill shadow-sm"
              required
            >
              <option value="☕">☕ Café</option>
              <option value="🥛">🥛 Leche</option>
              <option value="🍫">🍫 Chocolate</option>
              <option value="🍽️">🍽️ Cubiertos</option>
              <option value="🥤">🥤 Vasos</option>
              <option value="🍵">🍵 Té</option>
              <option value="📦">📦 Otro</option>
            </select>
          </div>
          <div className="col-12 col-sm-8">
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
          <div className="col-12 col-sm-4">
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
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow">
              <PlusCircle className="me-2" />
              <span className="d-none d-sm-inline">Guardar </span>Artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticuloForm;
