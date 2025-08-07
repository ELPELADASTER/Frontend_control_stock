import React, { useState, useEffect } from 'react';
import { Coffee, RotateCcw, Check, AlertCircle, Building2, MapPin, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';

interface Maquina {
  id: number;
  nombre: string;
  edificio: string;
  ubicacion?: string;
  empresa: string;
}

interface Conteo {
  id: number;
  maquina_id: number;
  cantidad_vasos: number;
  fecha_conteo: string;
  observaciones?: string;
  empresa: string;
  maquina_nombre: string;
  edificio: string;
  ubicacion?: string;
}

interface ContadorVasosProps {
  empresa: string;
  onConteoRealizado: () => void;
}

const ContadorVasos: React.FC<ContadorVasosProps> = ({ empresa, onConteoRealizado }) => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<string>('');
  const [conteoActual, setConteoActual] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [ultimosConteos, setUltimosConteos] = useState<Conteo[]>([]);
  const [editandoConteo, setEditandoConteo] = useState<number | null>(null);
  const [conteoEditado, setConteoEditado] = useState<{ cantidad: number; observaciones: string }>({ cantidad: 0, observaciones: '' });
  const [conteoAEliminar, setConteoAEliminar] = useState<number | null>(null);

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas?empresa=${encodeURIComponent(empresa)}`);
      const data = await res.json();
      setMaquinas(data);
    } catch (error) {
      console.error('Error al cargar máquinas:', error);
    }
  };

  const fetchUltimosConteos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/conteos/ultimos?empresa=${encodeURIComponent(empresa)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setUltimosConteos(data);
      }
    } catch (error) {
      console.error('Error al cargar últimos conteos:', error);
    }
  };

  const editarConteo = async (id: number) => {
    try {
      setGuardando(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/conteos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad_vasos: conteoEditado.cantidad,
          observaciones: conteoEditado.observaciones,
        }),
      });

      if (res.ok) {
        toast.success('Conteo actualizado exitosamente');
        setEditandoConteo(null);
        fetchUltimosConteos();
        onConteoRealizado();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al actualizar conteo');
      }
    } catch (error) {
      console.error('Error al editar conteo:', error);
      toast.error('Error al actualizar el conteo');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarConteo = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/conteos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Conteo eliminado exitosamente');
        fetchUltimosConteos();
        onConteoRealizado();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al eliminar conteo');
      }
    } catch (error) {
      console.error('Error al eliminar conteo:', error);
      toast.error('Error al eliminar el conteo');
    } finally {
      setConteoAEliminar(null);
    }
  };

  const confirmarEliminacion = (id: number) => {
    setConteoAEliminar(id);
  };

  const iniciarEdicion = (conteo: Conteo) => {
    setEditandoConteo(conteo.id);
    setConteoEditado({
      cantidad: conteo.cantidad_vasos,
      observaciones: conteo.observaciones || '',
    });
  };

  const cancelarEdicion = () => {
    setEditandoConteo(null);
    setConteoEditado({ cantidad: 0, observaciones: '' });
  };

  useEffect(() => {
    fetchMaquinas();
    fetchUltimosConteos();
  }, [empresa]);

  const resetearConteo = () => {
    setConteoActual(0);
  };

  const guardarConteo = async () => {
    if (!maquinaSeleccionada) {
      toast.error('Selecciona una máquina');
      return;
    }

    if (conteoActual === 0) {
      toast.error('El conteo debe ser mayor a 0');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/conteos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maquina_id: parseInt(maquinaSeleccionada),
          cantidad_vasos: conteoActual,
          observaciones: observaciones.trim() || null,
          empresa
        }),
      });

      if (res.ok) {
        toast.success(`✅ Conteo guardado: ${conteoActual} vasos`);
        setConteoActual(0);
        setObservaciones('');
        onConteoRealizado();
        fetchUltimosConteos();
      } else {
        const error = await res.json();
        toast.error(`Error: ${error.message || 'No se pudo guardar el conteo'}`);
      }
    } catch (error) {
      console.error('Error al guardar conteo:', error);
      toast.error('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  const maquinaSeleccionadaInfo = maquinas.find(m => m.id.toString() === maquinaSeleccionada);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-10">
        <div className="row">
          {/* Panel principal del contador */}
          <div className="col-12 col-lg-8 mb-4">
            <div className="card glass-card border-0 h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <Coffee className="text-primary" />
                  Contador de Vasos
                </h5>
              </div>
              <div className="card-body">
                {/* Selección de máquina */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Seleccionar Máquina:</label>
                  <select
                    className="form-select form-select-lg"
                    value={maquinaSeleccionada}
                    onChange={(e) => setMaquinaSeleccionada(e.target.value)}
                  >
                    <option value="">-- Selecciona una máquina --</option>
                    {maquinas.map((maquina) => (
                      <option key={maquina.id} value={maquina.id}>
                        {maquina.nombre} - {maquina.edificio}
                        {maquina.ubicacion && ` (${maquina.ubicacion})`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Info de máquina seleccionada */}
                  {maquinaSeleccionadaInfo && (
                    <div className="mt-2 p-3 bg-light rounded-3">
                      <div className="d-flex flex-column flex-sm-row gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <Building2 size={16} className="text-muted" />
                          <span className="small text-muted">Edificio:</span>
                          <span className="fw-semibold">{maquinaSeleccionadaInfo.edificio}</span>
                        </div>
                        {maquinaSeleccionadaInfo.ubicacion && (
                          <div className="d-flex align-items-center gap-2">
                            <MapPin size={16} className="text-muted" />
                            <span className="small text-muted">Ubicación:</span>
                            <span className="fw-semibold">{maquinaSeleccionadaInfo.ubicacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contador principal */}
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-4 py-4 px-3 mb-3">
                    <label className="form-label fw-bold text-primary mb-3">Cantidad de Vasos:</label>
                    <input
                      type="number"
                      className="form-control form-control-lg text-center fw-bold display-6 counter-input"
                      value={conteoActual}
                      onChange={(e) => setConteoActual(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      step="1"
                      placeholder="0"
                      style={{ 
                        fontSize: '2.5rem',
                        height: '80px',
                        border: '3px solid #0d6efd',
                        borderRadius: '15px',
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }}
                    />
                    <p className="text-muted mb-0 mt-2">vasos a registrar</p>
                  </div>
                  
                  {/* Controles adicionales */}
                  <div className="d-flex justify-content-center gap-3 mb-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setConteoActual(prev => Math.max(0, prev - 10))}
                      disabled={conteoActual < 10}
                    >
                      -10
                    </button>
                    
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setConteoActual(prev => Math.max(0, prev - 1))}
                      disabled={conteoActual === 0}
                    >
                      -1
                    </button>
                    
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setConteoActual(prev => prev + 1)}
                    >
                      +1
                    </button>
                    
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setConteoActual(prev => prev + 10)}
                    >
                      +10
                    </button>
                  </div>
                  
                  {/* Botones de acceso rápido */}
                  <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                    {[10, 25, 50, 100].map((valor) => (
                      <button
                        key={valor}
                        className="btn btn-outline-info btn-sm"
                        onClick={() => setConteoActual(valor)}
                      >
                        {valor}
                      </button>
                    ))}
                  </div>
                  
                  {/* Botón de reset */}
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetearConteo}
                    disabled={conteoActual === 0}
                  >
                    <RotateCcw size={16} className="me-1" />
                    Resetear
                  </button>
                </div>

                {/* Observaciones */}
                <div className="mb-4">
                  <label className="form-label">Observaciones (opcional):</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar comentarios sobre este conteo..."
                  />
                </div>

                {/* Botón de guardar */}
                <div className="d-grid">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={guardarConteo}
                    disabled={guardando || !maquinaSeleccionada || conteoActual === 0}
                  >
                    {guardando ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        Guardando...
                      </span>
                    ) : (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <Check size={20} />
                        Guardar Conteo
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de últimos conteos */}
          <div className="col-12 col-lg-4 mb-4">
            <div className="card glass-card border-0 h-100">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0 fw-bold">Últimos Conteos</h6>
              </div>
              <div className="card-body">
                {ultimosConteos.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {ultimosConteos.map((conteo) => (
                      <div key={conteo.id} className="list-group-item px-0 py-3 border-0">
                        {editandoConteo === conteo.id ? (
                          // Modo edición
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{conteo.maquina_nombre}</h6>
                                <p className="mb-1 text-muted small">{conteo.edificio}</p>
                                <small className="text-muted">
                                  {new Date(conteo.fecha_conteo).toLocaleString('es-ES')}
                                </small>
                              </div>
                            </div>
                            
                            {/* Campos de edición */}
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label small">Cantidad:</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={conteoEditado.cantidad}
                                  onChange={(e) => setConteoEditado(prev => ({ 
                                    ...prev, 
                                    cantidad: parseInt(e.target.value) || 0 
                                  }))}
                                  min="1"
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label small">Observaciones:</label>
                                <textarea
                                  className="form-control form-control-sm"
                                  rows={2}
                                  value={conteoEditado.observaciones}
                                  onChange={(e) => setConteoEditado(prev => ({ 
                                    ...prev, 
                                    observaciones: e.target.value 
                                  }))}
                                  placeholder="Observaciones opcionales..."
                                />
                              </div>
                            </div>
                            
                            {/* Botones de acción para edición */}
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm flex-fill"
                                onClick={() => editarConteo(conteo.id)}
                                disabled={guardando || conteoEditado.cantidad <= 0}
                              >
                                {guardando ? (
                                  <span className="d-flex align-items-center justify-content-center gap-1">
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                    Guardando...
                                  </span>
                                ) : (
                                  <span className="d-flex align-items-center justify-content-center gap-1">
                                    <Save size={14} />
                                    Guardar
                                  </span>
                                )}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo visualización
                          <div>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{conteo.maquina_nombre}</h6>
                                <p className="mb-1 text-muted small">{conteo.edificio}</p>
                                <small className="text-muted">
                                  {new Date(conteo.fecha_conteo).toLocaleString('es-ES')}
                                </small>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-2">
                                <span className="badge bg-primary bg-opacity-10 text-primary">
                                  {conteo.cantidad_vasos}
                                </span>
                                {/* Botones de acción */}
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => iniciarEdicion(conteo)}
                                    title="Editar conteo"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => confirmarEliminacion(conteo.id)}
                                    title="Eliminar conteo"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {conteo.observaciones && (
                              <p className="mt-2 mb-0 small text-muted fst-italic">
                                "{conteo.observaciones}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="text-muted mb-2" size={32} />
                    <p className="text-muted mb-0">No hay conteos registrados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de ayuda */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-start gap-3">
              <AlertCircle size={20} className="mt-1 flex-shrink-0" />
              <div>
                <h6 className="alert-heading mb-2">💡 Cómo usar el contador</h6>
                <ul className="mb-2 small">
                  <li>Selecciona la máquina donde estás realizando el conteo</li>
                  <li>Ingresa la cantidad de vasos directamente en el campo numérico</li>
                  <li>Usa los botones -/+ para ajustes finos o los valores rápidos (10, 25, 50, 100)</li>
                  <li>Agrega observaciones si es necesario (opcional)</li>
                  <li>Presiona "Guardar Conteo" para registrar los datos</li>
                </ul>
                <h6 className="alert-heading mb-2">✏️ Editar y eliminar conteos</h6>
                <ul className="mb-0 small">
                  <li>En la lista de "Últimos Conteos", usa el botón <Edit2 size={12} className="mx-1" /> para editar un conteo</li>
                  <li>Usa el botón <Trash2 size={12} className="mx-1" /> para eliminar un conteo (requiere confirmación)</li>
                  <li>Al editar, puedes modificar la cantidad de vasos y las observaciones</li>
                  <li>Los cambios se reflejan inmediatamente en las estadísticas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={conteoAEliminar !== null}
        title="Confirmar eliminación"
        message="¿Estás seguro de que quieres eliminar este conteo? Esta acción no se puede deshacer."
        onConfirm={() => conteoAEliminar && eliminarConteo(conteoAEliminar)}
        onCancel={() => setConteoAEliminar(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default ContadorVasos;
