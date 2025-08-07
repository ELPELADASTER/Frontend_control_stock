import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, RefreshCw, Download, Filter } from 'lucide-react';

interface DatoGrafico {
  fecha: string;
  cantidad: number;
  maquina_nombre?: string;
  maquina_id?: number;
}

interface DatosConsumo {
  consumoPorDia: DatoGrafico[];
  consumoPorMaquina: DatoGrafico[];
  tendenciaSemanal: DatoGrafico[];
  comparativaMensual: DatoGrafico[];
}

interface FiltroFecha {
  desde: string;
  hasta: string;
}

interface GraficosConsumoProps {
  empresa: string;
  fechaFiltro: FiltroFecha;
}

const GraficosConsumo: React.FC<GraficosConsumoProps> = ({ empresa, fechaFiltro }) => {
  const [datosConsumo, setDatosConsumo] = useState<DatosConsumo>({
    consumoPorDia: [],
    consumoPorMaquina: [],
    tendenciaSemanal: [],
    comparativaMensual: []
  });
  const [vistaGrafico, setVistaGrafico] = useState<'dia' | 'maquina' | 'tendencia' | 'comparativa'>('dia');
  const [cargando, setCargando] = useState<boolean>(false);
  const [tipoVisualizacion, setTipoVisualizacion] = useState<'tabla' | 'barras'>('barras');

  const fetchDatosConsumo = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        empresa,
        desde: fechaFiltro.desde,
        hasta: fechaFiltro.hasta
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/estadisticas/graficos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDatosConsumo(data);
      }
    } catch (error) {
      console.error('Error al cargar datos de consumo:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDatosConsumo();
  }, [empresa, fechaFiltro]);

  const exportarDatos = () => {
    let datosExportar: any[] = [];
    let filename = '';

    switch (vistaGrafico) {
      case 'dia':
        datosExportar = datosConsumo.consumoPorDia;
        filename = 'consumo-por-dia.csv';
        break;
      case 'maquina':
        datosExportar = datosConsumo.consumoPorMaquina;
        filename = 'consumo-por-maquina.csv';
        break;
      case 'tendencia':
        datosExportar = datosConsumo.tendenciaSemanal;
        filename = 'tendencia-semanal.csv';
        break;
      case 'comparativa':
        datosExportar = datosConsumo.comparativaMensual;
        filename = 'comparativa-mensual.csv';
        break;
    }

    if (datosExportar.length === 0) return;

    const headers = Object.keys(datosExportar[0]).join(',');
    const csv = [headers, ...datosExportar.map(row => Object.values(row).join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderGraficoBarras = (datos: DatoGrafico[], titulo: string, labelX: string, colorBarra: string) => {
    if (datos.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No hay datos disponibles para mostrar</p>
        </div>
      );
    }

    const maxValor = Math.max(...datos.map(d => d.cantidad));
    
    return (
      <div>
        <h6 className="mb-3">{titulo}</h6>
        <div className="chart-container" style={{ height: '300px', overflowY: 'auto' }}>
          {datos.map((dato, index) => {
            const altura = maxValor > 0 ? (dato.cantidad / maxValor) * 100 : 0;
            const label = dato.maquina_nombre || new Date(dato.fecha).toLocaleDateString('es-ES');
            
            return (
              <div key={index} className="d-flex align-items-end mb-3" style={{ height: '40px' }}>
                <div className="flex-shrink-0" style={{ width: '120px', fontSize: '0.8rem' }}>
                  {label}
                </div>
                <div className="flex-grow-1 position-relative mx-2">
                  <div
                    className={`bg-${colorBarra} bg-opacity-75 rounded`}
                    style={{
                      height: '20px',
                      width: `${altura}%`,
                      minWidth: dato.cantidad > 0 ? '20px' : '0px',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                <div className="flex-shrink-0 fw-semibold" style={{ width: '50px', textAlign: 'right' }}>
                  {dato.cantidad}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabla = (datos: DatoGrafico[], columnas: string[]) => {
    if (datos.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No hay datos disponibles para mostrar</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              {columnas.map((columna, index) => (
                <th key={index}>{columna}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((dato, index) => (
              <tr key={index}>
                <td>
                  {dato.maquina_nombre || new Date(dato.fecha).toLocaleDateString('es-ES')}
                </td>
                <td>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {dato.cantidad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getDatosActuales = () => {
    switch (vistaGrafico) {
      case 'dia':
        return datosConsumo.consumoPorDia;
      case 'maquina':
        return datosConsumo.consumoPorMaquina;
      case 'tendencia':
        return datosConsumo.tendenciaSemanal;
      case 'comparativa':
        return datosConsumo.comparativaMensual;
      default:
        return [];
    }
  };

  const getTituloGrafico = () => {
    switch (vistaGrafico) {
      case 'dia':
        return 'Consumo por Día';
      case 'maquina':
        return 'Consumo por Máquina';
      case 'tendencia':
        return 'Tendencia Semanal';
      case 'comparativa':
        return 'Comparativa Mensual';
      default:
        return '';
    }
  };

  const getColorBarra = () => {
    switch (vistaGrafico) {
      case 'dia':
        return 'primary';
      case 'maquina':
        return 'success';
      case 'tendencia':
        return 'info';
      case 'comparativa':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        {/* Controles superiores */}
        <div className="card glass-card border-0 mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${vistaGrafico === 'dia' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setVistaGrafico('dia')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <Calendar size={14} />
                      <span className="d-none d-sm-inline">Por </span>Día
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${vistaGrafico === 'maquina' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setVistaGrafico('maquina')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <Filter size={14} />
                      <span className="d-none d-sm-inline">Por </span>Máquina
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${vistaGrafico === 'tendencia' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setVistaGrafico('tendencia')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <TrendingUp size={14} />
                      <span className="d-none d-sm-inline">Tendencia</span>
                      <span className="d-sm-none">Tend.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${vistaGrafico === 'comparativa' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setVistaGrafico('comparativa')}
                  >
                    <span className="d-flex align-items-center gap-1">
                      <BarChart3 size={14} />
                      <span className="d-none d-sm-inline">Comparativa</span>
                      <span className="d-sm-none">Comp.</span>
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="d-flex gap-2 justify-content-md-end">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${tipoVisualizacion === 'barras' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setTipoVisualizacion('barras')}
                    >
                      <BarChart3 size={14} />
                    </button>
                    <button
                      type="button"
                      className={`btn ${tipoVisualizacion === 'tabla' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setTipoVisualizacion('tabla')}
                    >
                      📊
                    </button>
                  </div>
                  
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={fetchDatosConsumo}
                    disabled={cargando}
                  >
                    <RefreshCw size={14} className={cargando ? 'spin' : ''} />
                  </button>
                  
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={exportarDatos}
                    disabled={getDatosActuales().length === 0}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del gráfico */}
        <div className="card glass-card border-0">
          <div className="card-header bg-transparent border-0">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <BarChart3 className="text-primary" />
              {getTituloGrafico()}
            </h5>
          </div>
          <div className="card-body">
            {cargando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos...</p>
              </div>
            ) : (
              <>
                {tipoVisualizacion === 'barras' ? (
                  renderGraficoBarras(
                    getDatosActuales(),
                    getTituloGrafico(),
                    vistaGrafico === 'maquina' ? 'Máquina' : 'Fecha',
                    getColorBarra()
                  )
                ) : (
                  renderTabla(
                    getDatosActuales(),
                    [vistaGrafico === 'maquina' ? 'Máquina' : 'Fecha', 'Cantidad']
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Resumen estadístico */}
        {getDatosActuales().length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card glass-card border-0">
                <div className="card-body">
                  <h6 className="mb-3">Resumen Estadístico</h6>
                  <div className="row text-center">
                    <div className="col-6 col-md-3">
                      <div className="border-end">
                        <h5 className="text-primary mb-1">
                          {getDatosActuales().reduce((sum, d) => sum + d.cantidad, 0)}
                        </h5>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="border-end">
                        <h5 className="text-success mb-1">
                          {Math.round(getDatosActuales().reduce((sum, d) => sum + d.cantidad, 0) / getDatosActuales().length)}
                        </h5>
                        <small className="text-muted">Promedio</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="border-end">
                        <h5 className="text-info mb-1">
                          {Math.max(...getDatosActuales().map(d => d.cantidad))}
                        </h5>
                        <small className="text-muted">Máximo</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <h5 className="text-warning mb-1">
                        {Math.min(...getDatosActuales().map(d => d.cantidad))}
                      </h5>
                      <small className="text-muted">Mínimo</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraficosConsumo;
