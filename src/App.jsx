import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// --- COMPONENTES DE UI REUTILIZABLES ---

const Boton = ({ children, onClick, className = '', variant = 'principal', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    principal: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secundario: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    peligro: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
  };
  return <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`} />
);

const Textarea = (props) => (
  <textarea {...props} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`} />
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>{children}</div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">[X]</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---

function App() {
  // --- ESTADO ---
  const [vistaActual, setVistaActual] = useState('Mis Libros');
  const [libros, setLibros] = useState([]);
  const [artesanos, setArtesanos] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState({ mensaje: '', visible: false });
  const [modoOscuro, setModoOscuro] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  // Estado para modales de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  // Estado para la vista "Artesanos"
  const [artesanoEditando, setArtesanoEditando] = useState(null);
  const [nuevoArtesano, setNuevoArtesano] = useState({ nombre: '', prompt: '' });

  // Estado para la vista "Mis Libros"
  const [nuevoLibro, setNuevoLibro] = useState({ titulo: '', indice: '' });

  // Estado para "Área de Trabajo"
  const [capituloActivo, setCapituloActivo] = useState(null);
  const [textoBase, setTextoBase] = useState('');
  const [artesanosSeleccionados, setArtesanosSeleccionados] = useState({});
  const [generandoContenido, setGenerandoContenido] = useState(false);
  const [contenidoGenerado, setContenidoGenerado] = useState([]);
  
  // Estado para "Biblioteca"
  const [filtroArtesano, setFiltroArtesano] = useState('todos');


  // --- EFECTOS (PERSISTENCIA Y OTROS) ---

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    try {
      const librosGuardados = localStorage.getItem('fabricaContenido_libros');
      if (librosGuardados) setLibros(JSON.parse(librosGuardados));

      const artesanosGuardados = localStorage.getItem('fabricaContenido_artesanos');
      if (artesanosGuardados) {
        setArtesanos(JSON.parse(artesanosGuardados));
      } else {
        // Inicializar con artesanos por defecto si no hay nada guardado
        const artesanosDefault = [
          { id: 1, nombre: 'Corrector Ortográfico y Gramatical', prompt: 'Corrige la ortografía y la gramática del siguiente texto. No alteres el significado ni el estilo. Simplemente devuelve el texto corregido.' },
          { id: 2, nombre: 'Resumen Ejecutivo (50 palabras)', prompt: 'Crea un resumen ejecutivo de no más de 50 palabras para el siguiente texto.' },
          { id: 3, nombre: 'Transformar a Tono Casual', prompt: 'Re-escribe el siguiente texto con un tono más casual, amigable y conversacional, como si se lo estuvieras contando a un amigo.' },
        ];
        setArtesanos(artesanosDefault);
      }

      const apiKeyGuardada = localStorage.getItem('fabricaContenido_apiKey');
      if (apiKeyGuardada) setApiKey(apiKeyGuardada);

      const modoOscuroGuardado = localStorage.getItem('fabricaContenido_modoOscuro');
      const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModoOscuro(modoOscuroGuardado ? JSON.parse(modoOscuroGuardado) : prefiereOscuro);

    } catch (error) {
      console.error("Error al cargar datos de localStorage:", error);
      mostrarNotificacion("Error al cargar datos. Se usarán valores por defecto.");
    }
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => { localStorage.setItem('fabricaContenido_libros', JSON.stringify(libros)); }, [libros]);
  useEffect(() => { localStorage.setItem('fabricaContenido_artesanos', JSON.stringify(artesanos)); }, [artesanos]);
  useEffect(() => { localStorage.setItem('fabricaContenido_apiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('fabricaContenido_modoOscuro', JSON.stringify(modoOscuro)); }, [modoOscuro]);

  // Aplicar clase 'dark' al HTML
  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [modoOscuro]);

  // Ocultar notificación automáticamente
  useEffect(() => {
    if (notificacion.visible) {
      const timer = setTimeout(() => setNotificacion({ mensaje: '', visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);


  // --- MANEJADORES DE EVENTOS ---

  const mostrarNotificacion = (mensaje) => setNotificacion({ mensaje, visible: true });

  const abrirModalConfirmacion = (title, message, onConfirm) => {
    setModalConfirmacion({ isOpen: true, title, message, onConfirm });
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  };

  // --- Lógica de "Mis Libros" ---
  const handleCrearLibro = (e) => {
    e.preventDefault();
    if (!nuevoLibro.titulo.trim() || !nuevoLibro.indice.trim()) {
      mostrarNotificacion("El título y el índice son obligatorios.");
      return;
    }
    const capitulos = nuevoLibro.indice.split('\n').filter(linea => linea.trim() !== '').map(titulo => ({
      id: Date.now() + Math.random(),
      titulo: titulo.trim(),
      completado: false,
      contenido: [] // { artesanoId, nombreArtesano, texto }
    }));

    const nuevo = {
      id: Date.now(),
      titulo: nuevoLibro.titulo.trim(),
      capitulos,
    };
    setLibros([...libros, nuevo]);
    setNuevoLibro({ titulo: '', indice: '' });
    mostrarNotificacion("¡Libro creado con éxito!");
  };

  const handleEliminarLibro = (idLibro) => {
    const onConfirm = () => {
      setLibros(libros.filter(l => l.id !== idLibro));
      if (libroSeleccionado && libroSeleccionado.id === idLibro) {
        setLibroSeleccionado(null);
        setCapituloActivo(null);
      }
      mostrarNotificacion("Libro eliminado.");
      cerrarModalConfirmacion();
    };
    abrirModalConfirmacion("Confirmar Eliminación", "¿Estás seguro de que quieres eliminar este libro y todo su contenido? Esta acción es irreversible.", onConfirm);
  };
  
  const handleExportarBiblioteca = () => {
    try {
      const datos = {
        libros,
        artesanos,
      };
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      saveAs(blob, `biblioteca_fabrica_contenido_${new Date().toISOString().split('T')[0]}.json`);
      mostrarNotificacion("Biblioteca exportada con éxito.");
    } catch (error) {
      console.error("Error al exportar:", error);
      mostrarNotificacion("Error al exportar la biblioteca.");
    }
  };

  const handleImportarBiblioteca = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const datos = JSON.parse(event.target.result);
        if (datos.libros && datos.artesanos) {
          setLibros(datos.libros);
          setArtesanos(datos.artesanos);
          mostrarNotificacion("Biblioteca importada con éxito.");
        } else {
          mostrarNotificacion("Archivo de importación no válido.");
        }
      } catch (error) {
        console.error("Error al importar:", error);
        mostrarNotificacion("Error al leer el archivo de importación.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Para permitir re-importar el mismo archivo
  };


  // --- Lógica de "Artesanos" ---
  const handleGuardarArtesano = (e) => {
    e.preventDefault();
    const target = artesanoEditando ? artesanoEditando : nuevoArtesano;
    if (!target.nombre.trim() || !target.prompt.trim()) {
      mostrarNotificacion("El nombre y el prompt son obligatorios.");
      return;
    }

    if (artesanoEditando) {
      setArtesanos(artesanos.map(a => a.id === artesanoEditando.id ? artesanoEditando : a));
      mostrarNotificacion("Artesano actualizado.");
    } else {
      setArtesanos([...artesanos, { ...nuevoArtesano, id: Date.now() }]);
      mostrarNotificacion("Artesano creado.");
    }
    setArtesanoEditando(null);
    setNuevoArtesano({ nombre: '', prompt: '' });
  };

  const handleEliminarArtesano = (idArtesano) => {
    const onConfirm = () => {
      setArtesanos(artesanos.filter(a => a.id !== idArtesano));
      mostrarNotificacion("Artesano eliminado.");
      cerrarModalConfirmacion();
    };
    abrirModalConfirmacion("Confirmar Eliminación", "¿Estás seguro de que quieres eliminar este artesano?", onConfirm);
  };


  // --- Lógica de "Área de Trabajo" ---
  const handleSeleccionarLibro = (libro) => {
    setLibroSeleccionado(libro);
    setCapituloActivo(null);
    setTextoBase('');
    setContenidoGenerado([]);
    setVistaActual('Área de Trabajo');
  };

  const handleMarcarCapitulo = (idCapitulo) => {
    const nuevosLibros = libros.map(l => {
      if (l.id === libroSeleccionado.id) {
        const nuevosCapitulos = l.capitulos.map(c => {
          if (c.id === idCapitulo) {
            return { ...c, completado: !c.completado };
          }
          return c;
        });
        return { ...l, capitulos: nuevosCapitulos };
      }
      return l;
    });
    setLibros(nuevosLibros);
    setLibroSeleccionado(nuevosLibros.find(l => l.id === libroSeleccionado.id));
  };

  const seleccionarCapituloParaTrabajar = (capitulo) => {
    setCapituloActivo(capitulo);
    setTextoBase('');
    setContenidoGenerado([]);
    // Cargar contenido si ya existe
    const contenidoExistente = capitulo.contenido.find(c => c.artesanoId === 'base');
    if (contenidoExistente) {
      setTextoBase(contenidoExistente.texto);
    }
  };

  const handleGenerarContenido = async () => {
    const artesanosActivos = Object.entries(artesanosSeleccionados)
      .filter(([, seleccionado]) => seleccionado)
      .map(([id]) => artesanos.find(a => a.id === parseInt(id)));

    if (!apiKey) {
      mostrarNotificacion("Por favor, introduce tu clave de API de Gemini.");
      return;
    }
    if (!textoBase.trim()) {
      mostrarNotificacion("El texto base no puede estar vacío.");
      return;
    }
    if (artesanosActivos.length === 0) {
      mostrarNotificacion("Selecciona al menos un artesano.");
      return;
    }

    setGenerandoContenido(true);
    setContenidoGenerado([]);

    const resultados = [];
    for (const artesano of artesanosActivos) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${artesano.prompt}\n\n--- TEXTO A TRANSFORMAR ---\n\n${textoBase}` }] }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error de API: ${errorData.error.message}`);
        }

        const data = await response.json();
        const textoResultado = data.candidates[0].content.parts[0].text;
        resultados.push({
          artesanoId: artesano.id,
          nombreArtesano: artesano.nombre,
          texto: textoResultado,
        });
        setContenidoGenerado([...resultados]); // Actualizar UI en tiempo real
      } catch (error) {
        console.error(`Error con el artesano ${artesano.nombre}:`, error);
        resultados.push({
          artesanoId: artesano.id,
          nombreArtesano: artesano.nombre,
          texto: `**ERROR AL GENERAR:** ${error.message}`,
        });
        setContenidoGenerado([...resultados]);
      }
    }
    setGenerandoContenido(false);
    mostrarNotificacion("¡Contenido generado!");
  };

  const handleGuardarEnBiblioteca = () => {
    if (!capituloActivo || contenidoGenerado.length === 0) {
      mostrarNotificacion("No hay contenido generado para guardar.");
      return;
    }

    const nuevosLibros = libros.map(l => {
      if (l.id === libroSeleccionado.id) {
        const nuevosCapitulos = l.capitulos.map(c => {
          if (c.id === capituloActivo.id) {
            // Guardar texto base
            const contenidoActualizado = [{ artesanoId: 'base', nombreArtesano: 'Texto Base', texto: textoBase }];
            // Guardar/actualizar contenido generado
            contenidoGenerado.forEach(gen => {
              contenidoActualizado.push(gen);
            });
            // Mantener contenido de otros artesanos no seleccionados en esta ejecución
            c.contenido.forEach(cont => {
              if (cont.artesanoId !== 'base' && !contenidoActualizado.some(ca => ca.artesanoId === cont.artesanoId)) {
                contenidoActualizado.push(cont);
              }
            });
            return { ...c, contenido: contenidoActualizado };
          }
          return c;
        });
        return { ...l, capitulos: nuevosCapitulos };
      }
      return l;
    });

    setLibros(nuevosLibros);
    setLibroSeleccionado(nuevosLibros.find(l => l.id === libroSeleccionado.id));
    mostrarNotificacion("¡Contenido guardado en la Biblioteca!");
  };

  const handleDescargarZip = () => {
    if (contenidoGenerado.length === 0) {
      mostrarNotificacion("No hay contenido generado para descargar.");
      return;
    }
    const zip = new JSZip();
    const carpeta = zip.folder(capituloActivo.titulo.replace(/[^a-z0-9]/gi, '_'));
    
    carpeta.file("00_Texto_Base.txt", textoBase);
    contenidoGenerado.forEach((item, index) => {
      const nombreArchivo = `${String(index + 1).padStart(2, '0')}_${item.nombreArtesano.replace(/[^a-z0-9]/gi, '_')}.txt`;
      carpeta.file(nombreArchivo, item.texto);
    });

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, `${libroSeleccionado.titulo.replace(/[^a-z0-9]/gi, '_')}_${capituloActivo.titulo.replace(/[^a-z0-9]/gi, '_')}.zip`);
    });
    mostrarNotificacion("Descarga iniciada.");
  };


  // --- RENDERIZADO DE VISTAS ---

  const renderNotificacion = () => (
    <div className={`fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ${notificacion.visible ? 'translate-x-0' : 'translate-x-[120%]'}`}>
      {notificacion.mensaje}
    </div>
  );

  const renderSidebar = () => (
    <aside className={`absolute md:relative w-64 md:w-72 bg-gray-50 dark:bg-gray-800 h-full flex-shrink-0 flex flex-col border-r dark:border-gray-700 transition-transform duration-300 z-40 ${sidebarAbierta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">[i] Fábrica v5.0</h1>
        <button className="md:hidden" onClick={() => setSidebarAbierta(false)}>[X]</button>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {[{id: 'Mis Libros', icon: '[B]'}, {id: 'Área de Trabajo', icon: '[B+]'}, {id: 'Biblioteca', icon: '[L]'}, {id: 'Artesanos', icon: '[A]'}].map(item => (
          <button key={item.id} onClick={() => { setVistaActual(item.id); setSidebarAbierta(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left font-medium ${vistaActual === item.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {item.icon}
            {item.id}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Clave API Gemini</label>
          <Input type="password" placeholder="Introduce tu clave de API" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Modo Oscuro</span>
          <button onClick={() => setModoOscuro(!modoOscuro)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {modoOscuro ? '[Sol]' : '[Luna]'}
          </button>
        </div>
      </div>
    </aside>
  );

  const renderVistaMisLibros = () => {
    const calcularProgreso = (libro) => {
      const completados = libro.capitulos.filter(c => c.completado).length;
      return libro.capitulos.length > 0 ? (completados / libro.capitulos.length) * 100 : 0;
    };

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Mis Libros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {libros.map(libro => (
            <Card key={libro.id} className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">{libro.titulo}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{libro.capitulos.length} capítulos</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calcularProgreso(libro)}%` }}></div>
                </div>
                <p className="text-xs text-right mt-1">{Math.round(calcularProgreso(libro))}% completado</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Boton onClick={() => handleSeleccionarLibro(libro)} className="flex-1">Abrir</Boton>
                <Boton onClick={() => handleEliminarLibro(libro.id)} variant="peligro" className="px-3">[T]</Boton>
              </div>
            </Card>
          ))}
          <Card className="border-2 border-dashed dark:border-gray-600 flex flex-col items-center justify-center text-center">
             <h3 className="text-lg font-bold mb-2">Crear Nuevo Libro</h3>
             <form onSubmit={handleCrearLibro} className="w-full space-y-3">
                <Input placeholder="Título del libro" value={nuevoLibro.titulo} onChange={e => setNuevoLibro({...nuevoLibro, titulo: e.target.value})} />
                <Textarea placeholder="Índice (un capítulo por línea)" rows="4" value={nuevoLibro.indice} onChange={e => setNuevoLibro({...nuevoLibro, indice: e.target.value})} />
                <Boton type="submit" className="w-full">[+] Crear Libro</Boton>
             </form>
          </Card>
        </div>
        <h2 className="text-2xl font-bold mb-6 mt-12">Gestión de Biblioteca</h2>
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <Boton onClick={handleExportarBiblioteca} variant="secundario" className="w-full">[D] Exportar Biblioteca (.json)</Boton>
            <label className="w-full">
              <Boton as="span" variant="secundario" className="w-full cursor-pointer">[U] Importar Biblioteca (.json)</Boton>
              <input type="file" accept=".json" className="hidden" onChange={handleImportarBiblioteca} />
            </label>
          </div>
        </Card>
      </div>
    );
  };

  const renderVistaArtesanos = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Artesanos de Contenido</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-bold mb-4">{artesanoEditando ? 'Editar Artesano' : 'Crear Nuevo Artesano'}</h3>
          <form onSubmit={handleGuardarArtesano} className="space-y-4">
            <Input 
              placeholder="Nombre del artesano (ej. Tono Formal)" 
              value={artesanoEditando ? artesanoEditando.nombre : nuevoArtesano.nombre}
              onChange={e => artesanoEditando ? setArtesanoEditando({...artesanoEditando, nombre: e.target.value}) : setNuevoArtesano({...nuevoArtesano, nombre: e.target.value})}
            />
            <Textarea 
              placeholder="Prompt para la IA (ej. 'Re-escribe el siguiente texto con un tono profesional y académico...')" 
              rows="6"
              value={artesanoEditando ? artesanoEditando.prompt : nuevoArtesano.prompt}
              onChange={e => artesanoEditando ? setArtesanoEditando({...artesanoEditando, prompt: e.target.value}) : setNuevoArtesano({...nuevoArtesano, prompt: e.target.value})}
            />
            <div className="flex gap-2">
              <Boton type="submit" className="flex-1">{artesanoEditando ? 'Guardar Cambios' : 'Crear Artesano'}</Boton>
              {artesanoEditando && <Boton variant="secundario" onClick={() => setArtesanoEditando(null)}>Cancelar</Boton>}
            </div>
          </form>
        </Card>
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-4">Lista de Artesanos</h3>
          {artesanos.map(artesano => (
            <Card key={artesano.id} className="flex justify-between items-center">
              <p className="font-medium">{artesano.nombre}</p>
              <div className="flex gap-2">
                <Boton variant="secundario" onClick={() => setArtesanoEditando(artesano)}>Editar</Boton>
                <Boton variant="peligro" onClick={() => handleEliminarArtesano(artesano.id)}>[T]</Boton>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVistaAreaDeTrabajo = () => {
    if (!libroSeleccionado) {
      return (
        <div className="text-center py-20">
          <p className="text-4xl mx-auto text-gray-400 mb-4">[B]</p>
          <h2 className="text-2xl font-bold">Área de Trabajo</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Selecciona un libro desde "Mis Libros" para empezar a trabajar.</p>
        </div>
      );
    }

    const toggleTodosArtesanos = (e) => {
      const seleccionados = {};
      artesanos.forEach(a => { seleccionados[a.id] = e.target.checked; });
      setArtesanosSeleccionados(seleccionados);
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{libroSeleccionado.titulo}</h2>
          <Boton variant="secundario" onClick={() => setLibroSeleccionado(null)}>Cambiar Libro</Boton>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna 1: Índice */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-bold mb-4">Índice de Capítulos</h3>
              <ul className="space-y-2">
                {libroSeleccionado.capitulos.map(cap => (
                  <li key={cap.id} 
                      onClick={() => seleccionarCapituloParaTrabajar(cap)}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${capituloActivo?.id === cap.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                    <span className="flex-grow">{cap.titulo}</span>
                    <input type="checkbox" checked={cap.completado} onChange={() => handleMarcarCapitulo(cap.id)} className="ml-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Columna 2: Área de Creación */}
          <div className="lg:col-span-2">
            {!capituloActivo ? (
              <div className="text-center py-20 h-full flex flex-col justify-center items-center">
                <p className="text-4xl mx-auto text-gray-400 mb-4">[&lt;&gt;]</p>
                <h3 className="text-xl font-bold">Selecciona un capítulo</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Elige un capítulo del índice para empezar a generar contenido.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Capítulo: {capituloActivo.titulo}</h3>
                <Card>
                  <h4 className="font-bold mb-2">Texto Base</h4>
                  <Textarea rows="10" placeholder="Escribe o pega aquí el texto principal de tu capítulo..." value={textoBase} onChange={e => setTextoBase(e.target.value)} />
                </Card>
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Artesanos a Utilizar</h4>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" onChange={toggleTodosArtesanos} />
                      Seleccionar Todos
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {artesanos.map(a => (
                      <label key={a.id} className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700/50">
                        <input type="checkbox" checked={!!artesanosSeleccionados[a.id]} onChange={e => setArtesanosSeleccionados({...artesanosSeleccionados, [a.id]: e.target.checked})} />
                        <span className="text-sm">{a.nombre}</span>
                      </label>
                    ))}
                  </div>
                </Card>
                <div className="flex flex-col md:flex-row gap-4">
                  <Boton onClick={handleGenerarContenido} disabled={generandoContenido} className="flex-1">
                    {generandoContenido ? 'Generando...' : 'GENERAR CONTENIDO'}
                  </Boton>
                  <Boton onClick={handleGuardarEnBiblioteca} variant="secundario" disabled={generandoContenido}>[S] Guardar en Biblioteca</Boton>
                  <Boton onClick={handleDescargarZip} variant="secundario" disabled={generandoContenido}>[Z] Descargar (.zip)</Boton>
                </div>
                
                {/* Panel de Resultados */}
                {(generandoContenido || contenidoGenerado.length > 0) && (
                  <div className="space-y-4 pt-6">
                    <h3 className="text-xl font-bold">Resultados de Generación</h3>
                    {contenidoGenerado.map((item, index) => (
                      <Card key={index}>
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{item.nombreArtesano}</h4>
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{item.texto}</p>
                      </Card>
                    ))}
                    {generandoContenido && contenidoGenerado.length < Object.values(artesanosSeleccionados).filter(Boolean).length && (
                       <Card className="text-center">
                         <p className="animate-pulse">Procesando...</p>
                       </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVistaBiblioteca = () => {
    if (!libroSeleccionado) {
      return (
        <div className="text-center py-20">
          <p className="text-4xl mx-auto text-gray-400 mb-4">[L]</p>
          <h2 className="text-2xl font-bold">Biblioteca</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Selecciona un libro desde "Mis Libros" para ver su contenido.</p>
        </div>
      );
    }

    const contenidoFiltrado = libroSeleccionado.capitulos.map(cap => {
      const contenidos = cap.contenido.filter(cont => 
        filtroArtesano === 'todos' || String(cont.artesanoId) === filtroArtesano
      );
      return { ...cap, contenidos };
    }).filter(cap => cap.contenidos.length > 0);

    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Biblioteca: {libroSeleccionado.titulo}</h2>
          <div className="flex items-center gap-4">
            <Boton variant="secundario" onClick={() => setLibroSeleccionado(null)}>Cambiar Libro</Boton>
            <div className="flex items-center gap-2">
              <p>[S]</p>
              <select value={filtroArtesano} onChange={e => setFiltroArtesano(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3">
                <option value="todos">Filtrar por Artesano</option>
                <option value="base">Texto Base</option>
                {artesanos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {contenidoFiltrado.length > 0 ? contenidoFiltrado.map(cap => (
            <div key={cap.id}>
              <h3 className="text-xl font-semibold border-b-2 border-blue-500 pb-2 mb-4">{cap.titulo}</h3>
              <div className="space-y-4">
                {cap.contenidos.map((cont, index) => (
                  <Card key={index}>
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{cont.nombreArtesano}</h4>
                    <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{cont.texto}</p>
                  </Card>
                ))}
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-10">No hay contenido para el filtro seleccionado.</p>
          )}
        </div>
      </div>
    );
  };


  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="flex h-screen text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
      {renderNotificacion()}
      <Modal 
        isOpen={modalConfirmacion.isOpen} 
        onClose={cerrarModalConfirmacion} 
        title={modalConfirmacion.title}
      >
        <p>{modalConfirmacion.message}</p>
        <div className="flex justify-end gap-4 mt-6">
          <Boton variant="secundario" onClick={cerrarModalConfirmacion}>Cancelar</Boton>
          <Boton variant="peligro" onClick={modalConfirmacion.onConfirm}>Confirmar</Boton>
        </div>
      </Modal>
      
      {renderSidebar()}
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <button onClick={() => setSidebarAbierta(true)} className="md:hidden mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          [M]
        </button>
        {vistaActual === 'Mis Libros' && renderVistaMisLibros()}
        {vistaActual === 'Área de Trabajo' && renderVistaAreaDeTrabajo()}
        {vistaActual === 'Biblioteca' && renderVistaBiblioteca()}
        {vistaActual === 'Artesanos' && renderVistaArtesanos()}
      </main>
    </div>
  );
}

export default App;