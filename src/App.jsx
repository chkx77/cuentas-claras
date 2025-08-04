import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Bell, Plus, Trash2, Edit3, Check, X, AlertCircle, Menu, Filter, Download, Upload, RefreshCw } from 'lucide-react';

const SistemaPagosArgentina = () => {
  const [pagos, setPagos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoPago, setEditandoPago] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [estadoGuardado, setEstadoGuardado] = useState('guardando');

  // Categorías de servicios argentinos
  const categorias = [
    { id: 'luz', nombre: 'Luz (EPE/EDENOR/EDESUR)', nombreCorto: 'Luz', color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300' },
    { id: 'gas', nombre: 'Gas Natural', nombreCorto: 'Gas', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border-blue-300' },
    { id: 'agua', nombre: 'Agua', nombreCorto: 'Agua', color: 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-900 border-cyan-300' },
    { id: 'telefono', nombre: 'Teléfono/Internet', nombreCorto: 'Internet', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-green-300' },
    { id: 'alquiler', nombre: 'Alquiler', nombreCorto: 'Alquiler', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border-purple-300' },
    { id: 'expensas', nombre: 'Expensas', nombreCorto: 'Expensas', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border-orange-300' },
    { id: 'seguro', nombre: 'Seguro', nombreCorto: 'Seguro', color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-red-300' },
    { id: 'impuestos', nombre: 'Impuestos Municipales', nombreCorto: 'Impuestos', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-gray-300' },
    { id: 'monotributo', nombre: 'Monotributo', nombreCorto: 'Monotributo', color: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-900 border-indigo-300' },
    { id: 'patente', nombre: 'Patente Automotor', nombreCorto: 'Patente', color: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-900 border-pink-300' },
    { id: 'otros', nombre: 'Otros', nombreCorto: 'Otros', color: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 border-slate-300' }
  ];

  const [formulario, setFormulario] = useState({
    descripcion: '',
    categoria: 'luz',
    monto: '',
    fechaVencimiento: '',
    pagado: false,
    notas: ''
  });

  // Funciones de persistencia automática simple
  const STORAGE_KEY = 'pagos-argentina-data';
  const BACKUP_KEY = 'pagos-argentina-backup';

  const guardarDatos = (nuevosPagos) => {
    try {
      setEstadoGuardado('guardando');
      const datosParaGuardar = {
        pagos: nuevosPagos,
        version: '1.1',
        fechaActualizacion: new Date().toISOString(),
        totalRegistros: nuevosPagos.length
      };
      
      // Guardar datos principales
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datosParaGuardar));
      
      // Crear hasta 3 backups rotativos para mayor seguridad
      const backupData = {
        ...datosParaGuardar,
        esBackup: true,
        fechaBackup: new Date().toISOString()
      };
      
      // Sistema de backups rotativos
      const backup2 = localStorage.getItem(BACKUP_KEY);
      const backup3 = localStorage.getItem(BACKUP_KEY + '_2');
      
      if (backup2) localStorage.setItem(BACKUP_KEY + '_2', backup2);
      if (backup3) localStorage.setItem(BACKUP_KEY + '_3', backup3);
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
      
      setEstadoGuardado('guardado');
      
      // Mostrar estado guardado por 1.5 segundos
      setTimeout(() => {
        setEstadoGuardado('idle');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar datos:', error);
      setEstadoGuardado('error');
      setTimeout(() => {
        setEstadoGuardado('idle');
      }, 3000);
    }
  };

  const cargarDatos = () => {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEY);
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        if (datos.pagos && Array.isArray(datos.pagos)) {
          return datos.pagos;
        }
      }
      
      // Si falla, intentar cargar backups en orden
      const backupKeys = [BACKUP_KEY, BACKUP_KEY + '_2', BACKUP_KEY + '_3'];
      
      for (const backupKey of backupKeys) {
        try {
          const datosBackup = localStorage.getItem(backupKey);
          if (datosBackup) {
            const backup = JSON.parse(datosBackup);
            if (backup.pagos && Array.isArray(backup.pagos)) {
              console.log(`Datos recuperados desde backup: ${backupKey}`);
              return backup.pagos;
            }
          }
        } catch (backupError) {
          console.warn(`Error en backup ${backupKey}:`, backupError);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return [];
    }
  };

  // Cargar datos al inicializar
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSplash(false);
    }, 2500);

    // Cargar datos guardados automáticamente
    const pagosGuardados = cargarDatos();
    if (pagosGuardados.length > 0) {
      setPagos(pagosGuardados);
      console.log(`✅ Cargados ${pagosGuardados.length} pagos desde el dispositivo`);
    }

    return () => clearTimeout(timer);
  }, []);

  // Guardar datos automáticamente cuando cambien los pagos - SIN molestar al usuario
  useEffect(() => {
    // Solo guardar si hay pagos o si ya existían datos anteriormente
    const datosExistentes = localStorage.getItem(STORAGE_KEY);
    if (pagos.length > 0 || datosExistentes) {
      guardarDatos(pagos);
    }
  }, [pagos]);

  const manejarSubmit = () => {
    if (!formulario.descripcion || !formulario.monto || !formulario.fechaVencimiento) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    if (editandoPago) {
      setPagos(pagos.map(pago => 
        pago.id === editandoPago.id 
          ? { ...formulario, id: editandoPago.id, fechaCreacion: editandoPago.fechaCreacion }
          : pago
      ));
      setEditandoPago(null);
    } else {
      const nuevoPago = {
        ...formulario,
        id: Date.now(),
        fechaCreacion: new Date().toISOString().split('T')[0],
        monto: parseFloat(formulario.monto)
      };
      setPagos([...pagos, nuevoPago]);
    }

    setFormulario({
      descripcion: '',
      categoria: 'luz',
      monto: '',
      fechaVencimiento: '',
      pagado: false,
      notas: ''
    });
    setMostrarFormulario(false);
  };

  const eliminarPago = (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar este pago?');
    if (confirmacion) {
      setPagos(pagos.filter(pago => pago.id !== id));
    }
  };

  const editarPago = (pago) => {
    setFormulario(pago);
    setEditandoPago(pago);
    setMostrarFormulario(true);
  };

  const togglePagado = (id) => {
    setPagos(pagos.map(pago => 
      pago.id === id ? { ...pago, pagado: !pago.pagado } : pago
    ));
  };

  const obtenerColorCategoria = (categoriaId) => {
    return categorias.find(cat => cat.id === categoriaId)?.color || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-gray-300';
  };

  const obtenerNombreCategoria = (categoriaId, corto = false) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? (corto ? categoria.nombreCorto : categoria.nombre) : 'Desconocido';
  };

  const pagosFiltrados = pagos.filter(pago => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'pendientes') return !pago.pagado;
    if (filtroEstado === 'pagados') return pago.pagado;
    return true;
  });

  const totalPendiente = pagos
    .filter(pago => !pago.pagado)
    .reduce((total, pago) => total + pago.monto, 0);

  const proximosVencimientos = pagos
    .filter(pago => !pago.pagado)
    .filter(pago => {
      const hoy = new Date();
      const vencimiento = new Date(pago.fechaVencimiento);
      const diasDiferencia = (vencimiento - hoy) / (1000 * 60 * 60 * 24);
      return diasDiferencia <= 7 && diasDiferencia >= 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900">
      {/* Pantalla de Splash */}
      {mostrarSplash && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 flex items-center justify-center z-50">
          <div className="text-center px-8">
            {/* Logo animado */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="animate-bounce">
                  <FileText size={64} className="text-white mx-auto mb-4" />
                </div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full mx-auto animate-pulse"></div>
              </div>
            </div>

            {/* Título principal */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 animate-fade-in">
                Cuentas Claras, Bolsillo Vacío
              </h1>
              <p className="text-purple-200 text-lg md:text-xl font-medium animate-fade-in-delay">
                Gestiona todos tus servicios e impuestos
              </p>
            </div>

            {/* Features destacadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-slide-up">
                <DollarSign className="text-emerald-400 mx-auto mb-2" size={24} />
                <p className="text-white text-sm font-semibold">Control Total</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-slide-up-delay">
                <Bell className="text-amber-400 mx-auto mb-2" size={24} />
                <p className="text-white text-sm font-semibold">Recordatorios</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-slide-up-delay-2">
                <Calendar className="text-cyan-400 mx-auto mb-2" size={24} />
                <p className="text-white text-sm font-semibold">Guardado Auto</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="max-w-xs mx-auto">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-fuchsia-400 h-full rounded-full animate-loading-bar"></div>
              </div>
              <p className="text-purple-200 text-sm mt-3 animate-pulse">Cargando tus datos...</p>
            </div>

            {/* Versión */}
            <div className="mt-8 opacity-60">
              <p className="text-purple-200 text-xs">v1.1 - Argentina 🇦🇷 - Guardado Automático</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay-2 {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes loading-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 1s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay {
          animation: slide-up-delay 0.8s ease-out 1.2s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up-delay-2 0.8s ease-out 1.4s forwards;
          opacity: 0;
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-out forwards;
        }
      `}</style>

      {/* Header móvil optimizado */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-lg shadow-md">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Pagos Argentina
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 hidden sm:block">Gestiona tus servicios</p>
                  {/* Indicador de estado de guardado */}
                  <div className="flex items-center gap-1">
                    {estadoGuardado === 'guardando' && (
                      <div className="flex items-center gap-1">
                        <RefreshCw size={10} className="text-blue-500 animate-spin" />
                        <span className="text-xs text-blue-600">Guardando...</span>
                      </div>
                    )}
                    {estadoGuardado === 'guardado' && (
                      <div className="flex items-center gap-1">
                        <Check size={10} className="text-green-500" />
                        <span className="text-xs text-green-600">Guardado</span>
                      </div>
                    )}
                    {estadoGuardado === 'error' && (
                      <div className="flex items-center gap-1">
                        <X size={10} className="text-red-500" />
                        <span className="text-xs text-red-600">Error</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 sm:hidden"
              >
                <Filter size={18} />
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md text-sm font-semibold"
              >
                <Plus size={16} />
                <span className="hidden xs:inline">Nuevo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Panel de información simple - Sin botones complicados */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 mb-6 border border-white/20">
          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <FileText size={16} />
              Información de tus Datos
            </h3>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-green-800 font-semibold text-sm mb-1">
                💾 Tus datos están seguros
              </p>
              <p className="text-green-700 text-xs">
                Se guardan automáticamente en tu dispositivo • {pagos.length} pagos registrados
              </p>
              <p className="text-green-600 text-xs mt-1">
                📱 Funcionan en celular y computadora • No se pierden nunca
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas móviles */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-red-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-red-600/80 text-xs font-semibold uppercase tracking-wide mb-1">Total Pendiente</p>
                <p className="text-xl sm:text-2xl font-black text-red-700">
                  ${totalPendiente.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
                <DollarSign className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-orange-600/80 text-xs font-semibold uppercase tracking-wide mb-1">Pendientes</p>
                <p className="text-xl sm:text-2xl font-black text-orange-700">
                  {pagos.filter(p => !p.pagado).length}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg">
                <AlertCircle className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-yellow-200/50 xs:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-yellow-600/80 text-xs font-semibold uppercase tracking-wide mb-1">Próximos Vencimientos</p>
                <p className="text-xl sm:text-2xl font-black text-yellow-700">
                  {proximosVencimientos.length}
                </p>
                <p className="text-yellow-500 text-xs">En 7 días</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Bell className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de vencimientos móvil */}
        {proximosVencimientos.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50/95 to-orange-50/95 backdrop-blur-lg border-l-4 border-yellow-400 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="p-1 bg-yellow-400 rounded mr-2">
                <Bell className="text-white" size={16} />
              </div>
              <h3 className="font-bold text-yellow-800 text-sm">⚠️ Vencimientos próximos</h3>
            </div>
            <div className="space-y-2">
              {proximosVencimientos.map(pago => (
                <div key={pago.id} className="bg-white/60 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-yellow-800 mb-1">{pago.descripcion}</div>
                  <div className="text-yellow-700">
                    Vence: {new Date(pago.fechaVencimiento).toLocaleDateString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros móviles */}
        <div className={`bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 mb-6 border border-white/20 ${
          mostrarFiltros ? 'block' : 'hidden sm:block'
        }`}>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            <button
              onClick={() => {
                setFiltroEstado('todos');
                setMostrarFiltros(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                filtroEstado === 'todos'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({pagos.length})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('pendientes');
                setMostrarFiltros(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                filtroEstado === 'pendientes'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({pagos.filter(p => !p.pagado).length})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('pagados');
                setMostrarFiltros(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 xs:col-span-1 ${
                filtroEstado === 'pagados'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagados ({pagos.filter(p => p.pagado).length})
            </button>
          </div>
        </div>

        {/* Lista de pagos móvil optimizada */}
        <div className="space-y-4">
          {pagosFiltrados.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-white/20">
              <FileText size={48} className="text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                {pagos.length === 0 ? 'No hay pagos registrados' : 'No hay pagos en esta categoría'}
              </h3>
              <p className="text-gray-500 text-sm">
                {pagos.length === 0 
                  ? 'Agrega tu primer pago haciendo clic en "Nuevo"' 
                  : 'Cambia el filtro para ver otros pagos'
                }
              </p>
            </div>
          ) : (
            pagosFiltrados.map(pago => (
              <div
                key={pago.id}
                className={`bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-white/20 ${
                  pago.pagado ? 'opacity-80' : ''
                }`}
              >
                {/* Header del pago */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className={`text-base font-bold mb-2 ${
                      pago.pagado ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}>
                      {pago.descripcion}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                      obtenerColorCategoria(pago.categoria)
                    }`}>
                      {obtenerNombreCategoria(pago.categoria, true)}
                    </span>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pago.pagado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pago.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                  </div>
                </div>

                {/* Información del pago */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="text-green-600 font-medium text-xs">Monto</span>
                    </div>
                    <span className="font-bold text-green-800">
                      ${pago.monto.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-blue-600" />
                      <span className="text-blue-600 font-medium text-xs">Vencimiento</span>
                    </div>
                    <span className="text-blue-800 font-medium text-xs">
                      {new Date(pago.fechaVencimiento).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Notas */}
                {pago.notas && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                    <strong className="text-gray-700">Notas:</strong> 
                    <span className="text-gray-600 ml-1">{pago.notas}</span>
                  </div>
                )}

                {/* Botones de acción móviles */}
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePagado(pago.id)}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      pago.pagado
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {pago.pagado ? 'Marcar Pendiente' : 'Marcar Pagado'}
                  </button>
                  <button
                    onClick={() => editarPago(pago)}
                    className="bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-300"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => eliminarPago(pago.id)}
                    className="bg-red-500 text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal del formulario móvil optimizado */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 sm:m-4">
              <div className="p-4 sm:p-6">
                {/* Header del modal */}
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
                  <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {editandoPago ? '✏️ Editar Pago' : '➕ Nuevo Pago'}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">Complete la información del pago</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <input
                      type="text"
                      required
                      value={formulario.descripcion}
                      onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 text-sm"
                      placeholder="Ej: EDENOR - Factura Marzo"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      required
                      value={formulario.categoria}
                      onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 text-sm"
                    >
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                        Monto (ARS) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formulario.monto}
                        onChange={(e) => setFormulario({...formulario, monto: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                        Vencimiento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formulario.fechaVencimiento}
                        onChange={(e) => setFormulario({...formulario, fechaVencimiento: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={formulario.notas}
                      onChange={(e) => setFormulario({...formulario, notas: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 text-sm"
                      rows="2"
                      placeholder="Información adicional..."
                    />
                  </div>

                  <div className="flex items-center bg-purple-50 p-3 rounded-xl">
                    <input
                      type="checkbox"
                      id="pagado"
                      checked={formulario.pagado}
                      onChange={(e) => setFormulario({...formulario, pagado: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pagado" className="ml-3 block text-xs sm:text-sm font-semibold text-purple-800">
                      ✅ Marcar como pagado
                    </label>
                  </div>

                  <div className="flex gap-3 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={manejarSubmit}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm"
                    >
                      {editandoPago ? '💾 Actualizar' : '💾 Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormulario(false);
                        setEditandoPago(null);
                        setFormulario({
                          descripcion: '',
                          categoria: 'luz',
                          monto: '',
                          fechaVencimiento: '',
                          pagado: false,
                          notas: ''
                        });
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-10 text-center text-sm text-white/70 bg-white/5 backdrop-blur-lg border-t border-white/10 py-6">
        <p className="mb-1">
          © {new Date().getFullYear()} Cuentas Claras, Bolsillo Vacío — Todos los derechos reservados
        </p>
        <p>
          Hecho en Argentina —  
          <a
            href="https://wa.me/+543416590688"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fuchsia-400 hover:underline ml-1"
          >
            Hace tu consulta
          </a>
        </p>
        <p className="text-xs mt-2 opacity-75">
          💾 Tus datos se guardan solos en tu dispositivo • 🔒 Privados y seguros • 📱 Funcionan siempre
        </p>
      </footer>
    </div>
  );
};

export default SistemaPagosArgentina;