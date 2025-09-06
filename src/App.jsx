import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  XMarkIcon,
  InformationCircleIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  UsersIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CodeBracketIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  PencilIcon,
  FolderIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'; // Using outline icons

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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><XMarkIcon className="h-5 w-5" /></button>
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
  const [colecciones, setColecciones] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState({ mensaje: '', visible: false });
  const [modoOscuro, setModoOscuro] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [sidebarColapsada, setSidebarColapsada] = useState(false);

  // Estado para modales de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  // Estado para la vista "Artesanos"
  const [artesanoEditando, setArtesanoEditando] = useState(null);
  const [nuevoArtesano, setNuevoArtesano] = useState({ nombre: '', prompt: '' });

  // Estado para la vista "Colecciones"
  const [coleccionEditando, setColeccionEditando] = useState(null);
  const [nuevaColeccion, setNuevaColeccion] = useState({ nombre: '' });

  // Estado para la vista "Mis Libros"
  const [nuevoLibro, setNuevoLibro] = useState({ titulo: '', indice: '' });
  const [libroEditando, setLibroEditando] = useState(null);
  const [filtroColeccion, setFiltroColeccion] = useState('todas');

  // Estado para "Área de Creación"
  const [capituloActivo, setCapituloActivo] = useState(null);
  const [textoBase, setTextoBase] = useState('');
  const [artesanosSeleccionados, setArtesanosSeleccionados] = useState({});
  const [generandoContenido, setGenerandoContenido] = useState(false);
  const [contenidoGenerado, setContenidoGenerado] = useState([]);
  
  // Estado para "Biblioteca"
  const [filtroArtesano, setFiltroArtesano] = useState('todos');
  const [capituloBibliotecaSeleccionado, setCapituloBibliotecaSeleccionado] = useState('todos');

  const isFirstRenderLibros = useRef(true);
  const isFirstRenderArtesanos = useRef(true);
  const isFirstRenderColecciones = useRef(true);

  // --- EFECTOS (PERSISTENCIA Y OTROS) ---

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    // Cargar Libros
    try {
      const librosGuardados = localStorage.getItem('fabricaContenido_libros');
      if (librosGuardados) {
        setLibros(JSON.parse(librosGuardados));
      }
    } catch (error) {
      console.error("Error al cargar libros de localStorage:", error);
      setLibros([]);
    }

    // Cargar Colecciones
    try {
      const coleccionesGuardadas = localStorage.getItem('fabricaContenido_colecciones');
      if (coleccionesGuardadas) {
        setColecciones(JSON.parse(coleccionesGuardadas));
      }
    } catch (error) {
      console.error("Error al cargar colecciones de localStorage:", error);
      setColecciones([]);
    }

    // Cargar Artesanos
    try {
      const artesanosGuardados = localStorage.getItem('fabricaContenido_artesanos');
      let loadedArtesanos = [];
      if (artesanosGuardados !== null) {
        loadedArtesanos = JSON.parse(artesanosGuardados);
      }
      if (artesanosGuardados === null) {
        const artesanosDefault = [
          { id: 1, nombre: 'Corrector Ortográfico y Gramatical', prompt: 'Corrige la ortografía y la gramática del siguiente texto. No alteres el significado ni el estilo. Simplemente devuelve el texto corregido.' },
          { id: 2, nombre: 'Resumen Ejecutivo (50 palabras)', prompt: 'Crea un resumen ejecutivo de no más de 50 palabras para el siguiente texto.' },
          { id: 3, nombre: 'Transformar a Tono Casual', prompt: 'Re-escribe el siguiente texto con un tono más casual, amigable y conversacional, como si se lo estuvieras contando a un amigo.' },
        ];
        setArtesanos(artesanosDefault);
      } else {
        setArtesanos(loadedArtesanos);
      }
    } catch (error) {
      console.error("Error al cargar artesanos de localStorage:", error);
      const artesanosDefault = [
        { id: 1, nombre: 'Corrector Ortográfico y Gramatical', prompt: 'Corrige la ortografía y la gramática del siguiente texto. No alteres el significado ni el estilo. Simplemente devuelve el texto corregido.' },
        { id: 2, nombre: 'Resumen Ejecutivo (50 palabras)', prompt: 'Crea un resumen ejecutivo de no más de 50 palabras para el siguiente texto.' },
        { id: 3, nombre: 'Transformar a Tono Casual', prompt: 'Re-escribe el siguiente texto con un tono más casual, amigable y conversacional, como si se lo estuvieras contando a un amigo.' },
      ];
      setArtesanos(artesanosDefault);
    }

    // Cargar API Key
    const apiKeyGuardada = localStorage.getItem('fabricaContenido_apiKey');
    if (apiKeyGuardada) {
      setApiKey(apiKeyGuardada);
    }

    // Cargar Modo Oscuro
    try {
      const modoOscuroGuardado = localStorage.getItem('fabricaContenido_modoOscuro');
      const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModoOscuro(modoOscuroGuardado ? JSON.parse(modoOscuroGuardado) : prefiereOscuro);
    } catch (error) {
      console.error("Error al cargar modo oscuro de localStorage:", error);
      const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModoOscuro(prefiereOscuro);
    }
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    if (isFirstRenderLibros.current) {
      isFirstRenderLibros.current = false;
      return;
    }
    localStorage.setItem('fabricaContenido_libros', JSON.stringify(libros));
  }, [libros]);

  useEffect(() => {
    if (isFirstRenderColecciones.current) {
      isFirstRenderColecciones.current = false;
      return;
    }
    localStorage.setItem('fabricaContenido_colecciones', JSON.stringify(colecciones));
  }, [colecciones]);

  useEffect(() => {
    if (isFirstRenderArtesanos.current) {
      isFirstRenderArtesanos.current = false;
      return;
    }
    try {
      localStorage.setItem('fabricaContenido_artesanos', JSON.stringify(artesanos));
    } catch (error) {
      console.error("Error al guardar artesanos en localStorage:", error);
    }
  }, [artesanos]);

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

  const mostrarNotificacion = useCallback((mensaje) => setNotificacion({ mensaje, visible: true }), [setNotificacion]);

  const handleGuardarEnBiblioteca = useCallback(() => {
    if (!capituloActivo || contenidoGenerado.length === 0) {
      mostrarNotificacion("No hay contenido generado para guardar.");
      return;
    }

    const nuevosLibros = libros.map(l => {
      if (l.id === libroSeleccionado.id) {
        const nuevosCapitulos = l.capitulos.map(c => {
          if (c.id === capituloActivo.id) {
            const contenidoActualizado = [{ artesanoId: 'base', nombreArtesano: 'Texto Base', texto: textoBase }];
            contenidoGenerado.forEach(gen => {
              contenidoActualizado.push(gen);
            });
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
  }, [capituloActivo, contenidoGenerado, libros, libroSeleccionado, setLibros, setLibroSeleccionado, mostrarNotificacion, textoBase]);

  useEffect(() => {
    if (!generandoContenido && contenidoGenerado.length > 0) {
      handleGuardarEnBiblioteca();
    }
  }, [generandoContenido, contenidoGenerado.length, handleGuardarEnBiblioteca]);


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
      contenido: []
    }));

    const nuevo = {
      id: Date.now(),
      titulo: nuevoLibro.titulo.trim(),
      capitulos,
      fechaCreacion: new Date().toISOString(),
      collectionId: null,
    };
    setLibros([...libros, nuevo]);
    setNuevoLibro({ titulo: '', indice: '' });
    mostrarNotificacion("¡Libro creado con éxito!");
  };

  const handleGuardarLibro = () => {
    if (!libroEditando) return;
    setLibros(libros.map(l => l.id === libroEditando.id ? libroEditando : l));
    setLibroEditando(null);
    mostrarNotificacion("Libro actualizado con éxito.");
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

  const handleAsignarColeccion = (idLibro, collectionId) => {
    setLibros(libros.map(l => l.id === idLibro ? { ...l, collectionId: collectionId === 'ninguna' ? null : collectionId } : l));
    mostrarNotificacion("Libro asignado a colección.");
  };
  
  const handleExportarBiblioteca = () => {
    try {
      const datos = {
        libros,
        artesanos,
        colecciones,
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
          setLibros(datos.libros || []);
          setArtesanos(datos.artesanos || []);
          setColecciones(datos.colecciones || []);
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
    e.target.value = null;
  };

  // --- Lógica de "Colecciones" ---
  const handleGuardarColeccion = (e) => {
    e.preventDefault();
    const target = coleccionEditando ? coleccionEditando : nuevaColeccion;
    if (!target.nombre.trim()) {
      mostrarNotificacion("El nombre de la colección es obligatorio.");
      return;
    }

    if (coleccionEditando) {
      setColecciones(colecciones.map(c => c.id === coleccionEditando.id ? coleccionEditando : c));
      mostrarNotificacion("Colección actualizada.");
    } else {
      setColecciones([...colecciones, { ...nuevaColeccion, id: Date.now() }]);
      mostrarNotificacion("Colección creada.");
    }
    setColeccionEditando(null);
    setNuevaColeccion({ nombre: '' });
  };

  const handleEliminarColeccion = (idColeccion) => {
    const onConfirm = () => {
      setColecciones(colecciones.filter(c => c.id !== idColeccion));
      // Desasignar libros de la colección eliminada
      setLibros(libros.map(l => l.collectionId === idColeccion ? { ...l, collectionId: null } : l));
      mostrarNotificacion("Colección eliminada.");
      cerrarModalConfirmacion();
    };
    abrirModalConfirmacion("Confirmar Eliminación", "¿Estás seguro de que quieres eliminar esta colección? Los libros no serán eliminados.", onConfirm);
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
      setArtesanos(prevArtesanos => 
        prevArtesanos.map(a => a.id === artesanoEditando.id ? artesanoEditando : a)
      );
      mostrarNotificacion("Artesano actualizado.");
    } else {
      setArtesanos(prevArtesanos => [...prevArtesanos, { ...nuevoArtesano, id: Date.now() }]);
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


  // --- Lógica de "Área de Creación" ---
  const handleSeleccionarLibro = (libro) => {
    setLibroSeleccionado(libro);
    setCapituloActivo(null);
    setTextoBase('');
    setContenidoGenerado([]);
    setVistaActual('Área de Creación');
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

    const artesanosConContenido = artesanosActivos.filter(artesano =>
      capituloActivo.contenido.some(c => c.artesanoId === artesano.id)
    );

    if (artesanosConContenido.length > 0) {
      const nombresArtesanos = artesanosConContenido.map(a => a.nombre).join(', ');
      abrirModalConfirmacion(
        "Confirmar Sobrescribir",
        `Ya existe contenido para los siguientes artesanos: ${nombresArtesanos}. ¿Deseas sobrescribirlo?`,
        () => proceedWithGeneration(artesanosActivos)
      );
    } else {
      proceedWithGeneration(artesanosActivos);
    }
  };

  const proceedWithGeneration = async (artesanosActivos) => {
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
          fechaCreacion: new Date().toISOString(),
        });
        setContenidoGenerado([...resultados]);
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

  const handleDescargarCapituloZip = (capitulo) => {
    if (!capitulo || !capitulo.contenido || capitulo.contenido.length === 0) {
      mostrarNotificacion("No hay contenido en este capítulo para descargar.");
      return;
    }

    const zip = new JSZip();
    const carpeta = zip.folder(capitulo.titulo.replace(/[^a-z0-9]/gi, '_'));

    const textoBase = capitulo.contenido.find(c => c.artesanoId === 'base')?.texto || '';
    carpeta.file("00_Texto_Base.txt", textoBase);

    const otrosContenidos = capitulo.contenido.filter(c => c.artesanoId !== 'base');
    otrosContenidos.forEach((item, index) => {
      const nombreArchivo = `${String(index + 1).padStart(2, '0')}_${item.nombreArtesano.replace(/[^a-z0-9]/gi, '_')}.txt`;
      carpeta.file(nombreArchivo, item.texto);
    });

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, `${libroSeleccionado.titulo.replace(/[^a-z0-9]/gi, '_')}_${capitulo.titulo.replace(/[^a-z0-9]/gi, '_')}.zip`);
    });
    mostrarNotificacion("Descarga iniciada.");
  };


  // --- RENDERIZADO DE VISTAS ---

  const renderNotificacion = () => (
    <div className={`fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ${notificacion.visible ? 'translate-x-0' : 'translate-x-[120%]'}`}>
      {notificacion.mensaje}
    </div>
  );

  const renderModalEditarLibro = () => {
    if (!libroEditando) return null;

    return (
      <Modal isOpen={!!libroEditando} onClose={() => setLibroEditando(null)} title="Editar Libro">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
            <Input
              type="text"
              value={libroEditando.titulo}
              onChange={(e) => setLibroEditando({ ...libroEditando, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capítulos (uno por línea)</label>
            <Textarea
              rows="10"
              value={libroEditando.capitulos.map(c => c.titulo).join('\n')}
              onChange={(e) => {
                const titulos = e.target.value.split('\n');
                const nuevosCapitulos = titulos.map((titulo, index) => {
                  const capituloExistente = libroEditando.capitulos[index];
                  return capituloExistente ? { ...capituloExistente, titulo: titulo.trim() } : { id: Date.now() + Math.random(), titulo: titulo.trim(), completado: false, contenido: [] };
                });
                setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Boton variant="secundario" onClick={() => setLibroEditando(null)}>Cancelar</Boton>
          <Boton onClick={handleGuardarLibro}>Guardar Cambios</Boton>
        </div>
      </Modal>
    );
  };

  const renderSidebar = () => (
    <aside className={`relative bg-gray-50 dark:bg-gray-800 h-full flex-shrink-0 flex flex-col border-r dark:border-gray-700 transition-all duration-300 z-40 ${sidebarColapsada ? 'w-20' : 'w-64'}`}>
      <div className={`p-4 flex items-center border-b dark:border-gray-700 ${sidebarColapsada ? 'justify-center' : 'justify-between'}`}>
        {!sidebarColapsada && <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"><InformationCircleIcon className="h-6 w-6" /> Fábrica v5.0</h1>}
        <button onClick={() => setSidebarColapsada(!sidebarColapsada)} className="hidden md:block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
          {sidebarColapsada ? <ArrowRightOnRectangleIcon className="h-5 w-5" /> : <ArrowLeftOnRectangleIcon className="h-5 w-5" />}
        </button>
        <button className="md:hidden" onClick={() => setSidebarAbierta(false)}><XMarkIcon className="h-5 w-5" /></button>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {[{id: 'Mis Libros', icon: <BookOpenIcon className="h-5 w-5" />}, {id: 'Colecciones', icon: <FolderIcon className="h-5 w-5" />}, {id: 'Área de Creación', icon: <CodeBracketIcon className="h-5 w-5" />}, {id: 'Biblioteca', icon: <BuildingLibraryIcon className="h-5 w-5" />}, {id: 'Artesanos', icon: <UsersIcon className="h-5 w-5" />}].map(item => (
          <button key={item.id} onClick={() => { setVistaActual(item.id); setSidebarAbierta(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left font-medium ${sidebarColapsada ? 'justify-center' : ''} ${vistaActual === item.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {item.icon}
            {!sidebarColapsada && <span>{item.id}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700 space-y-4">
        <div className={`${sidebarColapsada ? 'hidden' : ''}`}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Clave API Gemini</label>
          <Input type="password" placeholder="Introduce tu clave de API" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>
        <div className={`flex items-center ${sidebarColapsada ? 'justify-center' : 'justify-between'}`}>
          {!sidebarColapsada && <span className="text-sm font-medium">Modo Oscuro</span>}
          <button onClick={() => setModoOscuro(!modoOscuro)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {modoOscuro ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
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

    const librosFiltrados = libros.filter(libro => 
      filtroColeccion === 'todas' || 
      (filtroColeccion === 'ninguna' && !libro.collectionId) ||
      (libro.collectionId && libro.collectionId === filtroColeccion)
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mis Libros</h2>
          <div className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-gray-500" />
            <select value={filtroColeccion} onChange={e => setFiltroColeccion(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3">
              <option value="todas">Todas las colecciones</option>
              <option value="ninguna">Sin colección</option>
              {colecciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {librosFiltrados.map(libro => (
            <Card key={libro.id} className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">{libro.titulo}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{libro.capitulos.length} capítulos</p>
                {libro.fechaCreacion && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Creado: {new Date(libro.fechaCreacion).toLocaleDateString()}
                  </p>
                )}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calcularProgreso(libro)}%` }}></div>
                </div>
                <p className="text-xs text-right mt-1">{Math.round(calcularProgreso(libro))}% completado</p>
                 <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500">Colección:</label>
                  <select 
                    value={libro.collectionId || 'ninguna'} 
                    onChange={(e) => handleAsignarColeccion(libro.id, e.target.value)}
                    className="w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm"
                  >
                    <option value="ninguna">Sin colección</option>
                    {colecciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Boton onClick={() => handleSeleccionarLibro(libro)} className="flex-1">Abrir</Boton>
                <Boton onClick={() => setLibroEditando(libro)} variant="secundario" className="px-3"><PencilIcon className="h-5 w-5" /></Boton>
                <Boton onClick={() => handleEliminarLibro(libro.id)} variant="peligro" className="px-3"><TrashIcon className="h-5 w-5" /></Boton>
              </div>
            </Card>
          ))}
          <Card className="border-2 border-dashed dark:border-gray-600 flex flex-col items-center justify-center text-center">
             <h3 className="text-lg font-bold mb-2">Crear Nuevo Libro</h3>
             <form onSubmit={handleCrearLibro} className="w-full space-y-3">
                <Input placeholder="Título del libro" value={nuevoLibro.titulo} onChange={e => setNuevoLibro({...nuevoLibro, titulo: e.target.value})} />
                <Textarea placeholder="Índice (un capítulo por línea)" rows="4" value={nuevoLibro.indice} onChange={e => setNuevoLibro({...nuevoLibro, indice: e.target.value})} />
                <Boton type="submit" className="w-full"><PlusIcon className="h-5 w-5" /> Crear Libro</Boton>
             </form>
          </Card>
        </div>
        <h2 className="text-2xl font-bold mb-6 mt-12">Gestión de Biblioteca</h2>
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <Boton onClick={handleExportarBiblioteca} variant="secundario" className="w-full"><ArrowDownTrayIcon className="h-5 w-5" /> Exportar Biblioteca (.json)</Boton>
            <label className="w-full">
              <Boton as="span" variant="secundario" className="w-full cursor-pointer"><ArrowUpTrayIcon className="h-5 w-5" /> Importar Biblioteca (.json)</Boton>
              <input type="file" accept=".json" className="hidden" onChange={handleImportarBiblioteca} />
            </label>
          </div>
        </Card>
      </div>
    );
  };

  const renderVistaColecciones = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Colecciones de Libros</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-bold mb-4">{coleccionEditando ? 'Editar Colección' : 'Crear Nueva Colección'}</h3>
          <form onSubmit={handleGuardarColeccion} className="space-y-4">
            <Input 
              placeholder="Nombre de la colección" 
              value={coleccionEditando ? coleccionEditando.nombre : nuevaColeccion.nombre}
              onChange={e => coleccionEditando ? setColeccionEditando({...coleccionEditando, nombre: e.target.value}) : setNuevaColeccion({...nuevaColeccion, nombre: e.target.value})}
            />
            <div className="flex gap-2">
              <Boton type="submit" className="flex-1">{coleccionEditando ? 'Guardar Cambios' : 'Crear Colección'}</Boton>
              {coleccionEditando && <Boton variant="secundario" onClick={() => setColeccionEditando(null)}>Cancelar</Boton>}
            </div>
          </form>
        </Card>
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-4">Lista de Colecciones</h3>
          {colecciones.map(coleccion => (
            <Card key={coleccion.id} className="flex justify-between items-center">
              <p className="font-medium">{coleccion.nombre}</p>
              <div className="flex gap-2">
                <Boton variant="secundario" onClick={() => setColeccionEditando(coleccion)}>Editar</Boton>
                <Boton variant="peligro" onClick={() => handleEliminarColeccion(coleccion.id)}><TrashIcon className="h-5 w-5" /></Boton>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

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
                <Boton variant="peligro" onClick={() => handleEliminarArtesano(artesano.id)}><TrashIcon className="h-5 w-5" /></Boton>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVistaAreaDeCreacion = () => {
    if (!libroSeleccionado) {
      return (
        <div className="text-center py-20">
          <p className="text-4xl mx-auto text-gray-400 mb-4"><BookOpenIcon className="h-10 w-10" /></p>
          <h2 className="text-2xl font-bold">Área de Creación</h2>
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
                <p className="text-4xl mx-auto text-gray-400 mb-4"><CodeBracketIcon className="h-10 w-10" /></p>
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
                  <Boton onClick={handleDescargarZip} variant="secundario" disabled={generandoContenido}><ArchiveBoxIcon className="h-5 w-5" /> Descargar (.zip)</Boton>
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

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      mostrarNotificacion("¡Copiado!");
    } catch (err) {
      console.error('Error al copiar: ', err);
      mostrarNotificacion("Error al copiar.");
    }
  };

  const handleEliminarContenido = (libroId, capituloId, artesanoId) => {
    const onConfirm = () => {
      setLibros(prevLibros => prevLibros.map(libro => {
        if (libro.id === libroId) {
          return {
            ...libro,
            capitulos: libro.capitulos.map(capitulo => {
              if (capitulo.id === capituloId) {
                return {
                  ...capitulo,
                  contenido: capitulo.contenido.filter(cont => cont.artesanoId !== artesanoId)
                };
              }
              return capitulo;
            })
          };
        }
        return libro;
      }));
      mostrarNotificacion("Contenido eliminado.");
      cerrarModalConfirmacion();
    };
    abrirModalConfirmacion("Confirmar Eliminación", "¿Estás seguro de que quieres eliminar este contenido? Esta acción es irreversible.", onConfirm);
  };

  const renderVistaBiblioteca = () => {
    if (!libroSeleccionado) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">Biblioteca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {libros.map(libro => (
              <Card key={libro.id} className="flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">{libro.titulo}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{libro.capitulos.length} capítulos</p>
                  {libro.fechaCreacion && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                      Creado: {new Date(libro.fechaCreacion).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Boton onClick={() => setLibroSeleccionado(libro)} className="flex-1">Abrir</Boton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const contenidoFiltrado = libroSeleccionado.capitulos
    .filter(cap => capituloBibliotecaSeleccionado === 'todos' || cap.id === parseFloat(capituloBibliotecaSeleccionado))
    .map(cap => {
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
              <Cog6ToothIcon className="h-5 w-5" />
              <select value={capituloBibliotecaSeleccionado} onChange={e => setCapituloBibliotecaSeleccionado(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3">
                <option value="todos">Todos los capítulos</option>
                {libroSeleccionado.capitulos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
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
              <div className="flex justify-between items-center border-b-2 border-blue-500 pb-2 mb-4">
                <h3 className="text-xl font-semibold">{cap.titulo}</h3>
                <Boton onClick={() => handleDescargarCapituloZip(cap)} variant="secundario">
                  <ArchiveBoxIcon className="h-5 w-5" /> Descargar Capítulo
                </Boton>
              </div>
              <div className="space-y-4">
                {cap.contenidos.map((cont, index) => {

                  return (
                    <Card key={index}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{cont.nombreArtesano}</h4>
                        <div className="flex items-center">
                            <>
                              {cont.fechaCreacion && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mr-4">
                                  Generado: {new Date(cont.fechaCreacion).toLocaleString()}
                                </p>
                              )}
                              <button
                                onClick={() => handleCopy(cont.texto)}
                                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                title="Copiar contenido"
                              >
                                <ClipboardDocumentListIcon className="h-5 w-5" />
                              </button>
                              {cont.artesanoId !== 'base' && (
                                <button
                                  onClick={() => handleEliminarContenido(libroSeleccionado.id, cap.id, cont.artesanoId)}
                                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 ml-2"
                                  title="Eliminar contenido"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                            </>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 mt-2">{cont.texto}</p>
                    </Card>
                  )
                })}
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

      {renderModalEditarLibro()}
      
      {renderSidebar()}
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <button onClick={() => setSidebarAbierta(true)} className="md:hidden mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          <Bars3Icon className="h-5 w-5" />
        </button>
        {vistaActual === 'Mis Libros' && renderVistaMisLibros()}
        {vistaActual === 'Colecciones' && renderVistaColecciones()}
        {vistaActual === 'Área de Creación' && renderVistaAreaDeCreacion()}
        {vistaActual === 'Biblioteca' && renderVistaBiblioteca()}
        {vistaActual === 'Artesanos' && renderVistaArtesanos()}
      </main>
    </div>
  );
}

export default App;