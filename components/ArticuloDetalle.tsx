import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface Articulo {
  id: number;
  nombre: string;
  cantidad: number;
  imagen?: string;
}

interface ArticuloDetalleProps {
  articulo: Articulo;
  onUtilizar: (id: number, cantidad: number) => void;
}

const ArticuloDetalle: React.FC<ArticuloDetalleProps> = ({ articulo, onUtilizar }) => {
  const [cantidadUtilizada, setCantidadUtilizada] = useState(0);

  const handleUtilizar = () => {
    if (cantidadUtilizada > 0 && cantidadUtilizada <= articulo.cantidad) {
      onUtilizar(articulo.id, cantidadUtilizada);
      setCantidadUtilizada(0);
    }
  };

  // Badge de stock
  let badge = null;
  if (articulo.cantidad <= 2) {
    badge = <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded ml-2">Stock bajo</span>;
  } else if (articulo.cantidad >= 10) {
    badge = <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded ml-2">Stock alto</span>;
  }

  return (
    <div className="glass-card p-6 flex gap-6 items-center hover:shadow-xl transition group">
      {articulo.imagen ? (
        <img src={`http://localhost:4000${articulo.imagen}`} alt={articulo.nombre} className="rounded-xl w-24 h-24 object-cover border border-border shadow-sm" />
      ) : (
        <span className="text-4xl bg-background rounded-xl w-24 h-24 flex items-center justify-center border border-border shadow-sm">📦</span>
      )}
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <h3 className="text-xl font-bold text-primary mr-2 truncate max-w-[70%]">{articulo.nombre}</h3>
          {badge && <span className="badge-modern ml-2">{badge.props.children}</span>}
        </div>
        <p className="text-sm text-textSecondary mb-3">Stock actual: <span className="font-bold text-text">{articulo.cantidad}</span></p>
        <div className="flex gap-3 items-center mt-2">
          <input
            type="number"
            min={1}
            max={articulo.cantidad}
            value={cantidadUtilizada}
            onChange={e => setCantidadUtilizada(Number(e.target.value))}
            className="input-modern w-24"
          />
          <button
            onClick={handleUtilizar}
            disabled={cantidadUtilizada < 1 || cantidadUtilizada > articulo.cantidad}
            className="btn-modern disabled:bg-border disabled:text-textSecondary disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5" />
            Utilizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticuloDetalle;
