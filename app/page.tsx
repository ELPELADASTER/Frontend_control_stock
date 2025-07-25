
'use client';
import React, { useEffect, useState } from 'react';
import ArticuloForm from '../components/ArticuloForm';
import ListaArticulos, { Articulo } from '../components/ListaArticulos';
import ArticuloEditModal from '../components/ArticuloEditModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMPRESAS = ['Telecom', 'Pago Online'];
const HomePage: React.FC = () => {
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
  const handleSaveEdit = async (data: { id: number; nombre: string; cantidad: number; utilizados: number; imagen?: File | null; empresa: string }) => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('cantidad', String(data.cantidad));
    formData.append('utilizados', String(data.utilizados));
    formData.append('empresa', data.empresa);
    if (data.imagen) formData.append('imagen', data.imagen);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL2}/api/articulos/${data.id}`, {
      method: 'PUT',
      body: formData,
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
    <main className="min-h-screen bg-gradient-to-br from-background via-white to-primary/10 flex flex-col items-center py-12 px-2">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-primary mb-4 text-center tracking-tight drop-shadow">Gestión de Artículos</h1>
        <div className="mb-12">
          <ArticuloForm onArticuloCreado={handleArticuloCreado} empresa={empresaForm} onEmpresaChange={handleEmpresaFormChange} />
        </div>
        <div className="mb-4 mx-auto" style={{maxWidth: 400}}>
          <div className="card bg-light shadow-sm border-0 rounded-4 px-3 py-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-building text-primary fs-4"></i>
              <label className="me-2 fw-semibold mb-0 small">Filtrar por empresa</label>
              <select className="form-select form-select-sm w-auto rounded-pill ms-2" value={empresa} onChange={handleEmpresaChange} style={{minWidth: 120}}>
                <option value="Telecom">Telecom</option>
                <option value="Pago Online">Pago Online</option>
              </select>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center mb-10">
          <div className="flex-grow h-px bg-border" />
          <span className="mx-4 text-textSecondary text-sm font-medium select-none">Artículos cargados</span>
          <div className="flex-grow h-px bg-border" />
        </div>
        <ListaArticulos
          articulos={articulos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
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
