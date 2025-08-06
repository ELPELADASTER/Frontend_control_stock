
'use client';
import React, { useEffect, useState } from 'react';
import ArticuloForm from '../components/ArticuloForm';
import ListaArticulos, { Articulo } from '../components/ListaArticulos';
import ArticuloEditModal from '../components/ArticuloEditModal';
import Maquinas from '../components/Maquinas';
import CargasMaquinas from '../components/CargasMaquinas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMPRESAS = ['Telecom', 'Pago Online'];
const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articulos' | 'maquinas' | 'cargas'>('articulos');
  const [empresa, setEmpresa] = useState<string>('Telecom');
  const [empresaForm, setEmpresaForm] = useState<string>('Telecom');
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [editArticulo, setEditArticulo] = useState<Articulo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchArticulos = async (empresaActual = empresa) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos?empresa=${encodeURIComponent(empresaActual)}`);
    const data = await res.json();
    setArticulos(data);
  };

  const handleActualizarStock = () => {
    console.log('handleActualizarStock llamado, actualizando lista de artículos...');
    fetchArticulos(); // Llamar sin parámetros para usar la empresa actual
  };

  useEffect(() => {
    fetchArticulos();
  }, [empresa]);

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmpresa(e.target.value);
  };
  const handleEmpresaFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmpresaForm(e.target.value);
  };

  const handleArticuloCreado = () => {
    fetchArticulos();
    toast.success('Artículo guardado con éxito ✅');
    setEmpresaForm(empresa); // reset al valor del filtro
  };


  const handleUtilizar = async (id: number, cantidad: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos/${id}/utilizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidadUtilizada: cantidad }),
    });
    if (res.ok) {
      toast.success('Cantidad descontada correctamente');
      fetchArticulos();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Error al descontar cantidad');
    }
  };

  // Eliminar artículo
  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este artículo?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Artículo eliminado');
      fetchArticulos();
    } else {
      toast.error('Error al eliminar');
    }
  };

  // Abrir modal de edición
  const handleEditar = (articulo: Articulo) => {
    setEditArticulo(articulo);
    setModalOpen(true);
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (data: { id: number; nombre: string; cantidad: number; utilizados: number; simbolo: string; empresa: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: data.nombre, cantidad: data.cantidad, utilizados: data.utilizados, simbolo: data.simbolo, empresa: data.empresa }),
    });
    if (res.ok) {
      toast.success('Artículo editado');
      setModalOpen(false);
      setEditArticulo(null);
      fetchArticulos();
    } else {
      toast.error('Error al editar');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-white to-primary/10">
      <div className="container-fluid">
        {/* Navigation Tabs */}
        <div className="pt-4 mb-4">
          <ul className="nav nav-tabs justify-content-center">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'articulos' ? 'active' : ''}`}
                onClick={() => setActiveTab('articulos')}
              >
                📦 Gestión de Artículos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'maquinas' ? 'active' : ''}`}
                onClick={() => setActiveTab('maquinas')}
              >
                🏢 Gestión de Máquinas
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'cargas' ? 'active' : ''}`}
                onClick={() => setActiveTab('cargas')}
              >
                📈 Cargas de Máquinas
              </button>
            </li>
          </ul>
        </div>

        {/* Company Selector */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6 col-lg-4">
            <div className="card bg-light shadow-sm border-0 rounded-4">
              <div className="card-body px-3 py-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-building text-primary fs-4"></i>
                  <label className="me-2 fw-semibold mb-0 small">Empresa:</label>
                  <select 
                    className="form-select form-select-sm w-auto rounded-pill ms-2" 
                    value={empresa} 
                    onChange={handleEmpresaChange} 
                    style={{minWidth: 120}}
                  >
                    <option value="Telecom">Telecom</option>
                    <option value="Pago Online">Pago Online</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'articulos' && (
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="mb-4">
                <ArticuloForm onArticuloCreado={handleArticuloCreado} empresa={empresaForm} onEmpresaChange={handleEmpresaFormChange} />
              </div>
              <ListaArticulos
                articulos={articulos}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
              />
            </div>
          </div>
        )}

        {activeTab === 'maquinas' && (
          <Maquinas empresa={empresa} />
        )}

        {activeTab === 'cargas' && (
          <CargasMaquinas 
            empresaInicial={empresa} 
            onActualizarStock={handleActualizarStock}
          />
        )}
      </div>

      <ArticuloEditModal
        articulo={editArticulo}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditArticulo(null); }}
        onSave={handleSaveEdit}
      />
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar theme="colored" />
    </main>
  );
};

export default HomePage;
