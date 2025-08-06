import React, { useState, useEffect } from 'react';
import { Calendar, Package, TrendingDown, History, Building2, Users, AlertTriangle, Search, RotateCcw, Plus, Trash2, Eye } from 'lucide-react';
import { Articulo } from './ListaArticulos';
import { Maquina } from './Maquinas';
import DetallesCargaModal from './DetallesCargaModal';

interface CargaAgrupada {
  id: number;
  maquina_id: number;
  usuario?: string;
  observaciones?: string;
  fecha: string;
  fecha_carga: string;
  maquina_nombre: string;
  edificio: string;
  ubicacion?: string;
  empresa: string;
  total_productos: number;
  total_cantidad: number;
  productos_detalle: string;
}

interface DetalleCarga {
  id: number;
  articulo_id: number;
  cantidad_cargada: number;
  fecha_carga: string;
  articulo_nombre: string;
  articulo_simbolo?: string;
}

interface Carga {
  id: number;
  maquina_id: number;
  articulo_id: number;
  cantidad_cargada: number;
  fecha_carga: string;
  usuario?: string;
  observaciones?: string;
  maquina_nombre: string;
  edificio: string;
  ubicacion?: string;
  empresa: string;
  articulo_nombre: string;
  articulo_simbolo?: string;
}

interface ProductoCarga {
  articulo_id: string;
  cantidad_cargada: number;
}

interface CargasMaquinasProps {
  empresaInicial?: string;
  onActualizarStock?: () => void;
}

const CargasMaquinas: React.FC<CargasMaquinasProps> = ({ empresaInicial = 'Telecom', onActualizarStock }) => {
  const [empresa, setEmpresa] = useState<'Telecom' | 'Pago Online'>(empresaInicial as 'Telecom' | 'Pago Online');
  const [cargasAgrupadas, setCargasAgrupadas] = useState<CargaAgrupada[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [estadisticas, setEstadisticas] = useState({totalCargas: 0, totalArticulos: 0});
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detallesCarga, setDetallesCarga] = useState<DetalleCarga[]>([]);
  const [cargaSeleccionada, setCargaSeleccionada] = useState<CargaAgrupada | null>(null);
  const [filtros, setFiltros] = useState({
    maquina_id: '',
    articulo_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [formData, setFormData] = useState({
    maquina_id: '',
    usuario: '',
    observaciones: ''
  });
  const [productos, setProductos] = useState<ProductoCarga[]>([{
    articulo_id: '',
    cantidad_cargada: 0
  }]);

  const fetchCargas = async () => {
    try {
      const params = new URLSearchParams({ empresa });
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/cargas/agrupadas?${params}`);
      const data = await res.json();
      setCargasAgrupadas(data);
      
      // Calcular estadísticas
      const totalCargas = data.length;
      const totalArticulos = data.reduce((sum: number, carga: CargaAgrupada) => sum + carga.total_cantidad, 0);
      setEstadisticas({ totalCargas, totalArticulos });
    } catch (error) {
      console.error('Error al cargar cargas:', error);
    }
  };

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/maquinas?empresa=${empresa}`);
      const data = await res.json();
      setMaquinas(data);
    } catch (error) {
      console.error('Error al cargar máquinas:', error);
    }
  };

  const fetchArticulos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos?empresa=${empresa}`);
      const data = await res.json();
      setArticulos(data);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
    }
  };

  const fetchDetallesCarga = async (maquinaId: number, fecha: string, usuario?: string) => {
    try {
      const params = new URLSearchParams();
      if (usuario) params.append('usuario', usuario);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/cargas/detalles/${maquinaId}/${fecha}?${params}`);
      const data = await res.json();
      setDetallesCarga(data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  const handleVerDetalles = async (carga: CargaAgrupada) => {
    setCargaSeleccionada(carga);
    await fetchDetallesCarga(carga.maquina_id, carga.fecha, carga.usuario);
    setShowDetalleModal(true);
  };

  // Actualizar empresa cuando cambie empresaInicial
  useEffect(() => {
    if (empresaInicial && empresaInicial !== empresa) {
      setEmpresa(empresaInicial as 'Telecom' | 'Pago Online');
    }
  }, [empresaInicial]);

  useEffect(() => {
    fetchCargas();
    fetchMaquinas();
    fetchArticulos();
  }, [empresa, filtros]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que hay productos seleccionados
    const productosValidos = productos.filter(p => p.articulo_id && p.cantidad_cargada > 0);
    if (!formData.maquina_id || productosValidos.length === 0) {
      alert('Debe seleccionar una máquina y al menos un producto');
      return;
    }

    // Validar stock para cada producto
    for (const producto of productosValidos) {
      const articulo = articulos.find(a => a.id === parseInt(producto.articulo_id));
      if (!articulo || articulo.disponibles < producto.cantidad_cargada) {
        alert(`Stock insuficiente para ${articulo?.nombre || 'el artículo seleccionado'}`);
        return;
      }
    }

    try {
      // Crear múltiples cargas
      const promises = productosValidos.map(producto => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/cargas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            maquina_id: formData.maquina_id,
            articulo_id: producto.articulo_id,
            cantidad_cargada: producto.cantidad_cargada,
            usuario: formData.usuario,
            observaciones: formData.observaciones
          })
        })
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(res => res.ok);

      if (allSuccessful) {
        resetForm();
        fetchCargas();
        fetchArticulos(); // Actualizar stock local
        console.log('Llamando a onActualizarStock para actualizar el componente padre...');
        onActualizarStock?.(); // Actualizar stock del componente padre
        alert('Cargas registradas exitosamente');
      } else {
        alert('Error al registrar algunas cargas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar las cargas');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta carga? Se revertirá el stock.')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/cargas/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchCargas();
        fetchArticulos(); // Actualizar stock local
        onActualizarStock?.(); // Actualizar stock del componente padre
        alert('Carga eliminada y stock revertido');
      } else {
        const error = await res.json();
        alert(error.error || 'Error al eliminar carga');
      }
    } catch (error) {
      console.error('Error al eliminar carga:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      maquina_id: '',
      usuario: '',
      observaciones: ''
    });
    setProductos([{
      articulo_id: '',
      cantidad_cargada: 0
    }]);
    setShowForm(false);
  };

  // Funciones para manejar múltiples productos
  const agregarProducto = () => {
    setProductos([...productos, { articulo_id: '', cantidad_cargada: 0 }]);
  };

  const eliminarProducto = (index: number) => {
    if (productos.length > 1) {
      setProductos(productos.filter((_, i) => i !== index));
    }
  };

  const actualizarProducto = (index: number, campo: keyof ProductoCarga, valor: string | number) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
    setProductos(nuevosProductos);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold text-primary">
            <Package className="me-2" />
            Cargas de Máquinas
          </h2>
          <div className="d-flex gap-3 mt-2">
            <span className="badge bg-primary fs-6">
              <Users size={14} className="me-1" />
              <strong>Empresa:</strong> {empresa}
            </span>
            <span className="badge bg-success fs-6">
              <Package size={14} className="me-1" />
              Total cargas: {estadisticas.totalCargas}
            </span>
            <span className="badge bg-info fs-6">
              <TrendingDown size={14} className="me-1" />
              Artículos cargados: {estadisticas.totalArticulos}
            </span>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-sm d-sm-none"
          onClick={() => setShowForm(true)}
        >
          <TrendingDown className="me-1" size={16} />
          Nueva
        </button>
        <button 
          className="btn btn-primary d-none d-sm-inline-flex"
          onClick={() => setShowForm(true)}
        >
          <TrendingDown className="me-2" />
          Nueva Carga
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">
                <Package size={14} className="me-1" />
                Máquina:
              </label>
              <select 
                className="form-select"
                value={filtros.maquina_id}
                onChange={(e) => setFiltros({...filtros, maquina_id: e.target.value})}
              >
                <option value="">Todas las máquinas</option>
                {maquinas.map(maquina => (
                  <option key={maquina.id} value={maquina.id}>
                    {maquina.nombre} ({maquina.edificio})
                    {maquina.ubicacion && ` - ${maquina.ubicacion}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">
                <Package size={14} className="me-1" />
                Artículo:
              </label>
              <select 
                className="form-select"
                value={filtros.articulo_id}
                onChange={(e) => setFiltros({...filtros, articulo_id: e.target.value})}
              >
                <option value="">Todos los artículos</option>
                {articulos.map(articulo => (
                  <option key={articulo.id} value={articulo.id}>
                    {articulo.simbolo} {articulo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">
                <Calendar size={14} className="me-1" />
                Desde:
              </label>
              <input
                type="date"
                className="form-control"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">
                <Calendar size={14} className="me-1" />
                Hasta:
              </label>
              <input
                type="date"
                className="form-control"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-3 d-flex flex-column flex-sm-row gap-2">
            <button 
              className="btn btn-primary flex-fill flex-sm-grow-0" 
              onClick={fetchCargas}
            >
              <Search className="me-1" size={16} />
              <span className="d-none d-sm-inline">Aplicar </span>Filtros
            </button>
            <button 
              className="btn btn-secondary flex-fill flex-sm-grow-0" 
              onClick={() => {
                setFiltros({
                  maquina_id: '',
                  articulo_id: '',
                  fecha_desde: '',
                  fecha_hasta: ''
                });
                fetchCargas();
              }}
            >
              <RotateCcw className="me-1" size={16} />
              <span className="d-none d-sm-inline">Limpiar </span>Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Formulario para Múltiples Productos */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Registrar Carga de Múltiples Productos</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">
                    <Package size={14} className="me-1" />
                    Máquina *
                  </label>
                  <select
                    className="form-select"
                    value={formData.maquina_id}
                    onChange={(e) => setFormData({...formData, maquina_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar máquina</option>
                    {maquinas.map(maquina => (
                      <option key={maquina.id} value={maquina.id}>
                        {maquina.nombre} - {maquina.edificio}
                        {maquina.ubicacion && ` (${maquina.ubicacion})`}
                        {` [${maquina.empresa}]`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <Users size={14} className="me-1" />
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del operador"
                    value={formData.usuario}
                    onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                  />
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Productos a Cargar</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={agregarProducto}
                  >
                    <Plus size={16} className="me-1" />
                    Agregar Producto
                  </button>
                </div>

                {productos.map((producto, index) => (
                  <div key={index} className="row g-3 mb-3 p-3 border rounded">
                    <div className="col-md-5">
                      <label className="form-label">Artículo *</label>
                      <select
                        className="form-select"
                        value={producto.articulo_id}
                        onChange={(e) => actualizarProducto(index, 'articulo_id', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar artículo</option>
                        {articulos.filter(a => a.disponibles > 0).map(articulo => (
                          <option key={articulo.id} value={articulo.id}>
                            {articulo.simbolo} {articulo.nombre} (Stock: {articulo.disponibles})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cantidad *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={articulos.find(a => a.id === parseInt(producto.articulo_id))?.disponibles || 999}
                        value={producto.cantidad_cargada}
                        onChange={(e) => actualizarProducto(index, 'cantidad_cargada', parseInt(e.target.value) || 0)}
                        required
                      />
                      {producto.articulo_id && (
                        <small className="text-muted">
                          Stock disponible: {articulos.find(a => a.id === parseInt(producto.articulo_id))?.disponibles || 0}
                        </small>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <div>
                        {productos.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProducto(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label">
                    <History size={14} className="me-1" />
                    Observaciones
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Notas adicionales sobre la carga (opcional)"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={!formData.maquina_id || productos.filter(p => p.articulo_id && p.cantidad_cargada > 0).length === 0}
                >
                  <TrendingDown className="me-1" size={16} />
                  Registrar Cargas
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  <RotateCcw className="me-1" size={16} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de cargas */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <History className="me-2" />
            Historial de Cargas
          </h5>
        </div>
        <div className="card-body p-0">
          {cargasAgrupadas.length === 0 ? (
            <div className="text-center py-5">
              <Package size={48} className="text-muted mb-3" />
              <p className="text-muted">No hay cargas registradas</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Máquina</th>
                    <th>Empresa</th>
                    <th>Productos</th>
                    <th>Total Cantidad</th>
                    <th className="d-none d-md-table-cell">Usuario</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargasAgrupadas.map(carga => (
                    <tr key={`${carga.maquina_id}-${carga.fecha}-${carga.usuario || 'no-user'}`}>
                      <td>
                        <Calendar size={14} className="me-1" />
                        {new Date(carga.fecha_carga).toLocaleDateString()}
                      </td>
                      <td>
                        <div>
                          <strong>{carga.maquina_nombre}</strong>
                          <br />
                          <small className="text-muted">{carga.edificio}</small>
                          {carga.ubicacion && (
                            <>
                              <br />
                              <small className="text-info">{carga.ubicacion}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${carga.empresa === 'Telecom' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                          <Building2 size={12} className="me-1" />
                          {carga.empresa}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className="badge bg-info me-1">{carga.total_productos}</span>
                          <small className="text-muted">productos</small>
                          <br />
                          <small className="text-truncate" style={{maxWidth: '200px', display: 'block'}}>
                            {carga.productos_detalle}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success fs-6">
                          {carga.total_cantidad}
                        </span>
                      </td>
                      <td className="d-none d-md-table-cell">
                        {carga.usuario || '-'}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleVerDetalles(carga)}
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(carga.id)}
                            title="Eliminar carga"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <DetallesCargaModal
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        detalles={detallesCarga}
        maquinaNombre={cargaSeleccionada?.maquina_nombre || ''}
        edificio={cargaSeleccionada?.edificio || ''}
        fecha={cargaSeleccionada?.fecha_carga || ''}
        usuario={cargaSeleccionada?.usuario}
        observaciones={cargaSeleccionada?.observaciones}
      />
    </div>
  );
};

export default CargasMaquinas;
