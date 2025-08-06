import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Settings, Calendar, Plus, Search, Filter, Users } from 'lucide-react';

export interface Maquina {
  id: number;
  nombre: string;
  edificio: string;
  ubicacion?: string;
  empresa: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

interface MaquinasProps {
  empresa: string;
}

const Maquinas: React.FC<MaquinasProps> = ({ empresa }) => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [maquinasFiltradas, setMaquinasFiltradas] = useState<Maquina[]>([]);
  const [edificios, setEdificios] = useState<string[]>([]);
  const [edificioSeleccionado, setEdificioSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editMaquina, setEditMaquina] = useState<Maquina | null>(null);
  const [estadisticas, setEstadisticas] = useState<{telecom: number, pagoOnline: number}>({telecom: 0, pagoOnline: 0});
  const [formData, setFormData] = useState({
    nombre: '',
    edificio: '',
    ubicacion: '',
    empresa: empresa
  });

  const fetchMaquinas = async () => {
    try {
      let url;
      if (empresa === 'Todas') {
        // Si es "Todas", obtener máquinas de ambas empresas
        url = edificioSeleccionado 
          ? `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas?edificio=${edificioSeleccionado}`
          : `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas`;
      } else {
        // Filtrar por empresa específica
        url = edificioSeleccionado 
          ? `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas?empresa=${empresa}&edificio=${edificioSeleccionado}`
          : `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas?empresa=${empresa}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setMaquinas(data);
      setMaquinasFiltradas(data);
      
      // Calcular estadísticas por empresa
      const telecom = data.filter((m: Maquina) => m.empresa === 'Telecom').length;
      const pagoOnline = data.filter((m: Maquina) => m.empresa === 'Pago Online').length;
      setEstadisticas({telecom, pagoOnline});
    } catch (error) {
      console.error('Error al cargar máquinas:', error);
    }
  };

  // Filtrar máquinas por búsqueda
  useEffect(() => {
    const filtradas = maquinas.filter(maquina =>
      maquina.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      maquina.edificio.toLowerCase().includes(busqueda.toLowerCase()) ||
      maquina.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
      (maquina.ubicacion && maquina.ubicacion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    setMaquinasFiltradas(filtradas);
  }, [maquinas, busqueda]);

  const fetchEdificios = async () => {
    try {
      const url = empresa === 'Todas' 
        ? `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas/edificios`
        : `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas/edificios?empresa=${empresa}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setEdificios(data);
    } catch (error) {
      console.error('Error al cargar edificios:', error);
    }
  };

  useEffect(() => {
    fetchMaquinas();
    fetchEdificios();
  }, [empresa, edificioSeleccionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editMaquina 
        ? `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas/${editMaquina.id}`
        : `${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas`;
      
      const method = editMaquina ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({ nombre: '', edificio: '', ubicacion: '', empresa });
        setShowForm(false);
        setEditMaquina(null);
        fetchMaquinas();
        fetchEdificios();
      }
    } catch (error) {
      console.error('Error al guardar máquina:', error);
    }
  };

  const handleEdit = (maquina: Maquina) => {
    setEditMaquina(maquina);
    setFormData({
      nombre: maquina.nombre,
      edificio: maquina.edificio,
      ubicacion: maquina.ubicacion || '',
      empresa: maquina.empresa
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta máquina?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchMaquinas();
        fetchEdificios();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al eliminar máquina');
      }
    } catch (error) {
      console.error('Error al eliminar máquina:', error);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', edificio: '', ubicacion: '', empresa });
    setShowForm(false);
    setEditMaquina(null);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold text-primary">
            <Building2 className="me-2" />
            Gestión de Máquinas
          </h2>
          <div className="d-flex gap-3 mt-2">
            <span className="badge bg-primary fs-6">
              <strong>Empresa:</strong> {empresa}
            </span>
            <span className="badge bg-info fs-6">
              Total: {maquinas.length} máquina{maquinas.length !== 1 ? 's' : ''}
            </span>
            {empresa === 'Todas' ? (
              <>
                <span className="badge bg-primary fs-6">
                  Telecom: {estadisticas.telecom}
                </span>
                <span className="badge bg-success fs-6">
                  Pago Online: {estadisticas.pagoOnline}
                </span>
              </>
            ) : (
              <span className="badge bg-secondary fs-6">
                Edificios: {edificios.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold d-flex align-items-center">
                <Search size={16} className="me-1" />
                <span className="d-none d-sm-inline">Buscar máquinas:</span>
                <span className="d-sm-none">Buscar:</span>
              </label>
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Nombre, empresa, edificio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label fw-semibold d-flex align-items-center">
                <Filter size={16} className="me-1" />
                <span className="d-none d-sm-inline">Filtrar por edificio:</span>
                <span className="d-sm-none">Edificio:</span>
              </label>
              <select 
                className="form-select rounded-pill"
                value={edificioSeleccionado}
                onChange={(e) => setEdificioSeleccionado(e.target.value)}
              >
                <option value="">Todos los edificios</option>
                {edificios.map(edificio => (
                  <option key={edificio} value={edificio}>{edificio}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="d-flex align-items-center justify-content-center justify-lg-start gap-2 flex-wrap">
                <span className="badge bg-info text-dark fs-6 px-3 py-2">
                  {maquinasFiltradas.length} máquina{maquinasFiltradas.length !== 1 ? 's' : ''}
                </span>
                <button 
                  className="btn btn-primary btn-sm d-sm-none"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="me-1" size={16} />
                  Nueva
                </button>
                <button 
                  className="btn btn-primary d-none d-sm-inline-flex"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="me-2" size={18} />
                  Nueva Máquina
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0 d-flex align-items-center">
              <Settings size={18} className="me-2" />
              <span className="d-none d-sm-inline">{editMaquina ? 'Editar' : 'Nueva'} Máquina</span>
              <span className="d-sm-none">{editMaquina ? 'Editar' : 'Nueva'}</span>
            </h5>
          </div>
          <div className="card-body p-3 p-md-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <Settings size={16} className="me-1" />
                    <span className="d-none d-sm-inline">Nombre de la máquina *</span>
                    <span className="d-sm-none">Nombre *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Ej: Máquina Expendedora A1"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <Users size={16} className="me-1" />
                    Empresa *
                  </label>
                  <select
                    className="form-select rounded-pill"
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    required
                  >
                    <option value="Telecom">Telecom</option>
                    <option value="Pago Online">Pago Online</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <Building2 size={16} className="me-1" />
                    Edificio *
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Ej: Edificio Principal, Torre A"
                    value={formData.edificio}
                    onChange={(e) => setFormData({...formData, edificio: e.target.value})}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <MapPin size={16} className="me-1" />
                    <span className="d-none d-sm-inline">Ubicación específica (opcional)</span>
                    <span className="d-sm-none">Ubicación</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Ej: Planta baja junto al ascensor"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4 d-flex justify-content-between align-items-center flex-column flex-sm-row gap-2">
                <small className="text-muted">* Campos obligatorios</small>
                <div className="d-flex gap-2 w-100 w-sm-auto">
                  <button type="button" className="btn btn-outline-secondary flex-fill flex-sm-grow-0" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary flex-fill flex-sm-grow-0">
                    <Plus size={16} className="me-1" />
                    <span className="d-none d-sm-inline">{editMaquina ? 'Actualizar' : 'Crear'} Máquina</span>
                    <span className="d-sm-none">{editMaquina ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de máquinas */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">Máquinas Registradas</h5>
        </div>
        <div className="card-body p-0">
          {maquinasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <Building2 size={48} className="text-muted mb-3" />
              {maquinas.length === 0 ? (
                <div>
                  <p className="text-muted mb-2">No hay máquinas registradas para <strong>{empresa}</strong></p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="me-1" />
                    Crear primera máquina
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-muted mb-2">No se encontraron máquinas con los filtros aplicados</p>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {setBusqueda(''); setEdificioSeleccionado('');}}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Edificio</th>
                    <th className="d-none d-md-table-cell">Ubicación</th>
                    <th className="d-none d-lg-table-cell">Estado</th>
                    <th className="d-none d-lg-table-cell">Fecha creación</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {maquinasFiltradas.map(maquina => (
                    <tr key={maquina.id}>
                      <td className="fw-semibold">{maquina.nombre}</td>
                      <td>
                        <span className={`badge ${maquina.empresa === 'Telecom' ? 'bg-primary' : 'bg-success'} text-white`}>
                          <Users size={14} className="me-1" />
                          {maquina.empresa}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">
                          <Building2 size={14} className="me-1" />
                          {maquina.edificio}
                        </span>
                      </td>
                      <td className="d-none d-md-table-cell text-muted">
                        {maquina.ubicacion ? (
                          <>
                            <MapPin size={14} className="me-1" />
                            {maquina.ubicacion}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="d-none d-lg-table-cell">
                        <span className={`badge ${maquina.estado === 'activa' ? 'bg-success' : 'bg-secondary'}`}>
                          {maquina.estado}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell text-muted small">
                        {maquina.created_at ? new Date(maquina.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleEdit(maquina)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(maquina.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maquinas;
