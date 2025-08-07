import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Coffee, Activity, Target, Clock, Zap } from 'lucide-react';
import ContadorVasos from './ContadorVasos';
import GraficosConsumo from './GraficosConsumo';

interface EstadisticasGenerales {
  totalVasosHoy: number;
  totalVasosSemana: number;
  totalVasosMes: number;
  maquinaMasUsada: string;
  promedioVasosPorDia: number;
  tendenciaConsumo: 'subida' | 'bajada' | 'estable';
}

interface EstadisticasPorMaquina {
  maquina_id: number;
  maquina_nombre: string;
  edificio: string;
  ubicacion?: string;
  totalVasos: number;
  ultimoConteo: string;
  promedioHora: number;
}

interface EstadisticasProps {
  empresa: string;
}

const Estadisticas: React.FC<EstadisticasProps> = ({ empresa }) => {
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'contador' | 'graficos'>('dashboard');
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales>({
    totalVasosHoy: 0,
    totalVasosSemana: 0,
    totalVasosMes: 0,
    maquinaMasUsada: '-',
    promedioVasosPorDia: 0,
    tendenciaConsumo: 'estable'
  });
  const [estadisticasPorMaquina, setEstadisticasPorMaquina] = useState<EstadisticasPorMaquina[]>([]);
  const [fechaFiltro, setFechaFiltro] = useState({
    desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  });

  const fetchEstadisticas = async () => {
    try {
      // Estadísticas generales
      const resGenerales = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL2}/api/estadisticas/generales?empresa=${encodeURIComponent(empresa)}`
      );
      if (resGenerales.ok) {
        const dataGenerales = await resGenerales.json();
        setEstadisticasGenerales(dataGenerales);
      }

      // Estadísticas por máquina
      const resMaquinas = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL2}/api/estadisticas/maquinas?empresa=${encodeURIComponent(empresa)}&desde=${fechaFiltro.desde}&hasta=${fechaFiltro.hasta}`
      );
      if (resMaquinas.ok) {
        const dataMaquinas = await resMaquinas.json();
        setEstadisticasPorMaquina(dataMaquinas);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [empresa, fechaFiltro]);

  const handleActualizarEstadisticas = () => {
    fetchEstadisticas();
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subida':
        return <TrendingUp className="text-success" size={20} />;
      case 'bajada':
        return <TrendingUp className="text-danger" size={20} style={{ transform: 'rotate(180deg)' }} />;
      default:
        return <Activity className="text-warning" size={20} />;
    }
  };

  return (
    <div className="container-fluid">
      {/* Header con navegación */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card glass-card border-0">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div>
                  <h4 className="mb-1 fw-bold text-primary d-flex align-items-center gap-2">
                    <BarChart3 size={24} />
                    <span>Estadísticas y Análisis</span>
                  </h4>
                  <p className="text-muted mb-0">Panel de control y análisis de consumo</p>
                </div>
                
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${vistaActual === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setVistaActual('dashboard')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <Activity size={16} />
                      <span className="d-none d-sm-inline">Dashboard</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${vistaActual === 'contador' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setVistaActual('contador')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <Coffee size={16} />
                      <span className="d-none d-sm-inline">Contador</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${vistaActual === 'graficos' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setVistaActual('graficos')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <BarChart3 size={16} />
                      <span className="d-none d-sm-inline">Gráficos</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      {vistaActual === 'dashboard' && (
        <>
          {/* Tarjetas de estadísticas principales */}
          <div className="row mb-4">
            <div className="col-6 col-md-3 mb-3">
              <div className="card glass-card border-0 h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <Coffee className="text-primary" size={24} />
                    </div>
                  </div>
                  <h5 className="fw-bold text-primary">{estadisticasGenerales.totalVasosHoy}</h5>
                  <p className="text-muted mb-0 small">
                    <span className="d-none d-sm-inline">Vasos </span>Hoy
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3 mb-3">
              <div className="card glass-card border-0 h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <Calendar className="text-success" size={24} />
                    </div>
                  </div>
                  <h5 className="fw-bold text-success">{estadisticasGenerales.totalVasosSemana}</h5>
                  <p className="text-muted mb-0 small">
                    <span className="d-none d-sm-inline">Esta </span>Semana
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3 mb-3">
              <div className="card glass-card border-0 h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <Target className="text-info" size={24} />
                    </div>
                  </div>
                  <h5 className="fw-bold text-info">{estadisticasGenerales.promedioVasosPorDia}</h5>
                  <p className="text-muted mb-0 small">
                    <span className="d-none d-sm-inline">Promedio </span>Diario
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3 mb-3">
              <div className="card glass-card border-0 h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      {getTendenciaIcon(estadisticasGenerales.tendenciaConsumo)}
                    </div>
                  </div>
                  <h6 className="fw-bold mb-1">Tendencia</h6>
                  <p className="text-muted mb-0 small text-capitalize">
                    {estadisticasGenerales.tendenciaConsumo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card glass-card border-0">
                <div className="card-body">
                  <div className="row align-items-end">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <label className="form-label">Desde:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={fechaFiltro.desde}
                        onChange={(e) => setFechaFiltro(prev => ({ ...prev, desde: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <label className="form-label">Hasta:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={fechaFiltro.hasta}
                        onChange={(e) => setFechaFiltro(prev => ({ ...prev, hasta: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-primary w-100"
                        onClick={fetchEstadisticas}
                      >
                        <span className="d-flex align-items-center justify-content-center gap-1">
                          <Zap size={16} />
                          Actualizar
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de estadísticas por máquina */}
          <div className="row">
            <div className="col-12">
              <div className="card glass-card border-0">
                <div className="card-header bg-transparent border-0">
                  <h5 className="mb-0 fw-bold">Consumo por Máquina</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Máquina</th>
                          <th className="d-none d-md-table-cell">Ubicación</th>
                          <th>Total Vasos</th>
                          <th className="d-none d-sm-table-cell">Promedio/Hora</th>
                          <th className="d-none d-lg-table-cell">Último Conteo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estadisticasPorMaquina.map((maquina) => (
                          <tr key={maquina.maquina_id}>
                            <td>
                              <div>
                                <div className="fw-semibold">{maquina.maquina_nombre}</div>
                                <small className="text-muted">{maquina.edificio}</small>
                              </div>
                            </td>
                            <td className="d-none d-md-table-cell">
                              {maquina.ubicacion || '-'}
                            </td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {maquina.totalVasos}
                              </span>
                            </td>
                            <td className="d-none d-sm-table-cell">
                              {maquina.promedioHora.toFixed(1)}
                            </td>
                            <td className="d-none d-lg-table-cell">
                              <small className="text-muted">
                                {maquina.ultimoConteo ? 
                                  new Date(maquina.ultimoConteo).toLocaleDateString('es-ES') : 
                                  'Sin datos'
                                }
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {estadisticasPorMaquina.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted">No hay datos disponibles para el período seleccionado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contador de Vasos */}
      {vistaActual === 'contador' && (
        <ContadorVasos
          empresa={empresa}
          onConteoRealizado={handleActualizarEstadisticas}
        />
      )}

      {/* Gráficos */}
      {vistaActual === 'graficos' && (
        <GraficosConsumo
          empresa={empresa}
          fechaFiltro={fechaFiltro}
        />
      )}
    </div>
  );
};

export default Estadisticas;
