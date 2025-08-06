import React from 'react';
import { Calendar, Package, User, FileText, X } from 'lucide-react';

interface DetalleCarga {
  id: number;
  articulo_id: number;
  cantidad_cargada: number;
  fecha_carga: string;
  articulo_nombre: string;
  articulo_simbolo?: string;
}

interface DetallesCargaModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalles: DetalleCarga[];
  maquinaNombre: string;
  edificio: string;
  fecha: string;
  usuario?: string;
  observaciones?: string;
}

const DetallesCargaModal: React.FC<DetallesCargaModalProps> = ({
  isOpen,
  onClose,
  detalles,
  maquinaNombre,
  edificio,
  fecha,
  usuario,
  observaciones
}) => {
  if (!isOpen) return null;

  const totalProductos = detalles.length;
  const totalCantidad = detalles.reduce((sum, detalle) => sum + detalle.cantidad_cargada, 0);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Package className="me-2" />
              Detalles de Carga - {maquinaNombre}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Información general */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="text-muted">Máquina:</strong>
                    <div>{maquinaNombre} - {edificio}</div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-muted">Fecha:</strong>
                    <div>
                      <Calendar size={16} className="me-1" />
                      {new Date(fecha).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-muted">Usuario:</strong>
                    <div>
                      <User size={16} className="me-1" />
                      {usuario || 'No especificado'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-muted">Total productos:</strong>
                    <div>
                      <span className="badge bg-primary">{totalProductos}</span>
                      <span className="ms-2">({totalCantidad} unidades)</span>
                    </div>
                  </div>
                  {observaciones && (
                    <div className="col-12">
                      <strong className="text-muted">Observaciones:</strong>
                      <div>
                        <FileText size={16} className="me-1" />
                        {observaciones}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Productos Cargados</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle, index) => (
                        <tr key={detalle.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="fs-5 me-2">{detalle.articulo_simbolo}</span>
                              <span>{detalle.articulo_nombre}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {detalle.cantidad_cargada}
                            </span>
                          </td>
                          <td className="text-muted">
                            {new Date(detalle.fecha_carga).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <X className="me-1" size={16} />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesCargaModal;
