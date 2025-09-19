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
  PlayIcon,
  PlayCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import PdfViewer from './components/PdfViewer'; // Using outline icons

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl m-4 flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

  const renderVistaGestionEtiquetas = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Gestión de Etiquetas</h2>

        {/* Video Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de Video</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.video.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('video', tag)}
                  className="ml-1 text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de video"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('video', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('video', document.querySelector('input[placeholder="Nueva etiqueta de video"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>

        {/* Audio Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de Audio</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.audio.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('audio', tag)}
                  className="ml-1 text-green-800 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de audio"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('audio', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('audio', document.querySelector('input[placeholder="Nueva etiqueta de audio"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>

        {/* PDF Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de PDF</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.pdf.map((tag, index) => (
              <span key={index} className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('pdf', tag)}
                  className="ml-1 text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de PDF"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('pdf', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('pdf', document.querySelector('input[placeholder="Nueva etiqueta de PDF"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>
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
  const [gruposArtesanos, setGruposArtesanos] = useState([]);
  const [grupoArtesanoEditando, setGrupoArtesanoEditando] = useState(null);
  const [nuevoGrupoArtesano, setNuevoGrupoArtesano] = useState({ nombre: '', artesanoIds: [] });
  const [modalGrupoArtesanoOpen, setModalGrupoArtesanoOpen] = useState(false);


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
  const [traducciones, setTraducciones] = useState([]);
  
  // Estado para el Artesano Multicultural
  const [idiomasDisponibles] = useState(['Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano']);
  const [idiomasSeleccionados, setIdiomasSeleccionados] = useState([]);


  // Estado para "Biblioteca"
  const [filtroArtesano, setFiltroArtesano] = useState('todos');
  const [grupoArtesanoSeleccionado, setGrupoArtesanoSeleccionado] = useState('todos');
  const [capituloBibliotecaSeleccionado, setCapituloBibliotecaSeleccionado] = useState('todos');
  const [filtroColeccionBiblioteca, setFiltroColeccionBiblioteca] = useState('todas');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoModalTitle, setVideoModalTitle] = useState('');
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioModalTitle, setAudioModalTitle] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfModalTitle, setPdfModalTitle] = useState('');

  // Estado para la gestión de etiquetas
  const [mediaTags, setMediaTags] = useState({
    video: [],
    audio: [],
    pdf: []
  });

  const isFirstRenderLibros = useRef(true);
  const isFirstRenderArtesanos = useRef(true);
  const isFirstRenderColecciones = useRef(true);
  const isFirstRenderGruposArtesanos = useRef(true);
  const isFirstRenderMediaTags = useRef(true);


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
		  { id: 'multicultural', nombre: 'Artesano Multicultural', prompt: 'Este es un artesano especial para traducciones.' },
        ];
        setArtesanos(artesanosDefault);
      } else {
        // Asegurarse de que el artesano multicultural exista si se cargan desde localStorage
        const multiculturalExists = loadedArtesanos.some(a => a.id === 'multicultural');
        if (!multiculturalExists) {
          loadedArtesanos.push({ id: 'multicultural', nombre: 'Artesano Multicultural', prompt: 'Este es un artesano especial para traducciones.' });
        }
        setArtesanos(loadedArtesanos);
      }
    } catch (error) {
      console.error("Error al cargar artesanos de localStorage:", error);
      const artesanosDefault = [
        { id: 1, nombre: 'Corrector Ortográfico y Gramatical', prompt: 'Corrige la ortografía y la gramática del siguiente texto. No alteres el significado ni el estilo. Simplemente devuelve el texto corregido.' },
        { id: 2, nombre: 'Resumen Ejecutivo (50 palabras)', prompt: 'Crea un resumen ejecutivo de no más de 50 palabras para el siguiente texto.' },
        { id: 3, nombre: 'Transformar a Tono Casual', prompt: 'Re-escribe el siguiente texto con un tono más casual, amigable y conversacional, como si se lo estuvieras contando a un amigo.' },
		{ id: 'multicultural', nombre: 'Artesano Multicultural', prompt: 'Este es un artesano especial para traducciones.' },
      ];
      setArtesanos(artesanosDefault);
    }

    // Cargar Grupos de Artesanos
    try {
      const gruposGuardados = localStorage.getItem('fabricaContenido_gruposArtesanos');
      if (gruposGuardados) {
        setGruposArtesanos(JSON.parse(gruposGuardados));
      }
    } catch (error) {
      console.error("Error al cargar grupos de artesanos de localStorage:", error);
      setGruposArtesanos([]);
    }

    // Cargar Etiquetas de Medios
    try {
      const mediaTagsGuardadas = localStorage.getItem('fabricaContenido_mediaTags');
      if (mediaTagsGuardadas) {
        setMediaTags(JSON.parse(mediaTagsGuardadas));
      } else {
        // Initialize with default empty arrays if nothing is found
        setMediaTags({ video: [], audio: [], pdf: [] });
      }
    } catch (error) {
      console.error("Error al cargar etiquetas de medios de localStorage:", error);
      setMediaTags({ video: [], audio: [], pdf: [] });
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

  useEffect(() => {
    if (isFirstRenderGruposArtesanos.current) {
      isFirstRenderGruposArtesanos.current = false;
      return;
    }
    try {
      localStorage.setItem('fabricaContenido_gruposArtesanos', JSON.stringify(gruposArtesanos));
    } catch (error) {
      console.error("Error al guardar grupos de artesanos en localStorage:", error);
    }
  }, [gruposArtesanos]);

  useEffect(() => {
    if (isFirstRenderMediaTags.current) {
      isFirstRenderMediaTags.current = false;
      return;
    }
    try {
      localStorage.setItem('fabricaContenido_mediaTags', JSON.stringify(mediaTags));
    } catch (error) {
      console.error("Error al guardar etiquetas de medios en localStorage:", error);
    }
  }, [mediaTags]);


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
    if (!capituloActivo || (contenidoGenerado.length === 0 && traducciones.length === 0)) {
      mostrarNotificacion("No hay contenido generado para guardar.");
      return;
    }
  
    const nuevosLibros = libros.map(l => {
      if (l.id === libroSeleccionado.id) {
        const nuevosCapitulos = l.capitulos.map(c => {
          if (c.id === capituloActivo.id) {
            // Contenido base y de artesanos normales
            const contenidoActualizado = [{ artesanoId: 'base', nombreArtesano: 'Texto Base', texto: textoBase }];
            contenidoGenerado.forEach(gen => {
              contenidoActualizado.push(gen);
            });
            c.contenido.forEach(cont => {
              if (cont.artesanoId !== 'base' && !contenidoActualizado.some(ca => ca.artesanoId === cont.artesanoId)) {
                contenidoActualizado.push(cont);
              }
            });
  
            // Añadir o actualizar traducciones
            const traduccionesActualizadas = c.traducciones ? [...c.traducciones] : [];
            traducciones.forEach(trad => {
              const index = traduccionesActualizadas.findIndex(t => t.idioma === trad.idioma);
              if (index > -1) {
                traduccionesActualizadas[index] = trad; // Sobrescribir
              } else {
                traduccionesActualizadas.push(trad); // Añadir
              }
            });
  
            return { ...c, contenido: contenidoActualizado, traducciones: traduccionesActualizadas };
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
    // Limpiar los estados de generación
    setContenidoGenerado([]);
    setTraducciones([]);
  }, [capituloActivo, contenidoGenerado, traducciones, libros, libroSeleccionado, setLibros, setLibroSeleccionado, mostrarNotificacion, textoBase]);

  useEffect(() => {
    if (!generandoContenido && (contenidoGenerado.length > 0 || traducciones.length > 0)) {
      handleGuardarEnBiblioteca();
    }
  }, [generandoContenido, contenidoGenerado.length, traducciones.length, handleGuardarEnBiblioteca]);


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
      contenido: [],
      traducciones: [],
      videoItems: [],
      audioItems: [],
      pdfItems: []
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
        gruposArtesanos,
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
          setGruposArtesanos(datos.gruposArtesanos || []);
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

  // --- Lógica de "Grupos de Artesanos" ---
  const abrirModalGrupoArtesano = (grupo = null) => {
    if (grupo) {
      setGrupoArtesanoEditando(grupo);
    } else {
      setGrupoArtesanoEditando({ nombre: '', artesanoIds: [] });
    }
    setModalGrupoArtesanoOpen(true);
  };

  const cerrarModalGrupoArtesano = () => {
    setModalGrupoArtesanoOpen(false);
    setGrupoArtesanoEditando(null);
  };

  const handleGuardarGrupoArtesano = () => {
    if (!grupoArtesanoEditando || !grupoArtesanoEditando.nombre.trim()) {
      mostrarNotificacion("El nombre del grupo es obligatorio.");
      return;
    }

    if (grupoArtesanoEditando.id) {
      // Editar grupo existente
      setGruposArtesanos(gruposArtesanos.map(g => g.id === grupoArtesanoEditando.id ? grupoArtesanoEditando : g));
      mostrarNotificacion("Grupo actualizado.");
    } else {
      // Crear nuevo grupo
      setGruposArtesanos([...gruposArtesanos, { ...grupoArtesanoEditando, id: Date.now() }]);
      mostrarNotificacion("Grupo creado.");
    }
    cerrarModalGrupoArtesano();
  };

  const handleEliminarGrupoArtesano = (idGrupo) => {
    const onConfirm = () => {
      setGruposArtesanos(gruposArtesanos.filter(g => g.id !== idGrupo));
      mostrarNotificacion("Grupo eliminado.");
      cerrarModalConfirmacion();
    };
    abrirModalConfirmacion("Confirmar Eliminación", "¿Estás seguro de que quieres eliminar este grupo?", onConfirm);
  };

  const handleAddTag = (type, tag) => {
    if (tag && !mediaTags[type].includes(tag)) {
      setMediaTags(prevTags => ({
        ...prevTags,
        [type]: [...prevTags[type], tag]
      }));
    }
  };

  const handleRemoveTag = (type, tagToRemove) => {
    setMediaTags(prevTags => ({
      ...prevTags,
      [type]: prevTags[type].filter(tag => tag !== tagToRemove)
    }));
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
      .map(([id]) => artesanos.find(a => a.id.toString() === id.toString()));
  
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
  
    const esMulticultural = artesanosActivos.some(a => a.id === 'multicultural');
    if (esMulticultural && idiomasSeleccionados.length === 0) {
      mostrarNotificacion("Por favor, selecciona al menos un idioma para el Artesano Multicultural.");
      return;
    }
  
    const artesanosNormales = artesanosActivos.filter(a => a.id !== 'multicultural');
    const artesanosConContenido = artesanosNormales.filter(artesano =>
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
    setTraducciones([]);
  
    const artesanosNormales = artesanosActivos.filter(a => a.id !== 'multicultural');
    const esMulticultural = artesanosActivos.some(a => a.id === 'multicultural');
  
    const resultados = [];
    for (const artesano of artesanosNormales) {
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
  
    if (esMulticultural) {
      await generarTraducciones();
    }
  
    setGenerandoContenido(false);
    mostrarNotificacion("¡Proceso de generación completado!");
  };
  
  const generarTraducciones = async () => {
    const resultadosTraduccion = [];
    for (const idioma of idiomasSeleccionados) {
      try {
        const prompt = `Traduce el siguiente texto al ${idioma}. Mantén el significado y el tono originales. Devuelve únicamente el texto traducido.`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${prompt}\n\n--- TEXTO A TRANSFORMAR ---\n\n${textoBase}` }] }]
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error de API: ${errorData.error.message}`);
        }
  
        const data = await response.json();
        const textoResultado = data.candidates[0].content.parts[0].text;
        resultadosTraduccion.push({
          idioma: idioma,
          texto: textoResultado,
          fechaCreacion: new Date().toISOString(),
        });
        setTraducciones([...resultadosTraduccion]);
      } catch (error) {
        console.error(`Error al traducir a ${idioma}:`, error);
        resultadosTraduccion.push({
          idioma: idioma,
          texto: `**ERROR AL TRADUCIR:** ${error.message}`,
        });
        setTraducciones([...resultadosTraduccion]);
      }
    }
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

  const abrirVideoModal = (item) => {
    setVideoUrl(item.url);
    setVideoModalTitle(item.name || 'Visor de Video');
    setVideoModalOpen(true);
  };

  const cerrarVideoModal = () => {
    setVideoUrl('');
    setVideoModalTitle('');
    setVideoModalOpen(false);
  };

    const renderVideoPlayerModal = () => {
    if (!videoModalOpen) return null;

    let embedUrl = '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return (
      <Modal isOpen={videoModalOpen} onClose={cerrarVideoModal} title={videoModalTitle}>
        <div className="aspect-w-16 aspect-h-9">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <p>URL de video no válida. Por favor, introduce una URL de YouTube o Vimeo.</p>
          )}
        </div>
      </Modal>
    );
  };

  const abrirAudioModal = (item) => {
    setAudioUrl(item.url);
    setAudioModalTitle(item.name || 'Reproductor de Audio');
    setAudioModalOpen(true);
  };

  const cerrarAudioModal = () => {
    setAudioUrl('');
    setAudioModalTitle('');
    setAudioModalOpen(false);
  };

  const renderAudioPlayerModal = () => {
    if (!audioModalOpen) return null;
    console.log('Audio URL:', audioUrl);

    return (
      <Modal isOpen={audioModalOpen} onClose={cerrarAudioModal} title={audioModalTitle}>
        <div className="p-4">
          <audio controls autoPlay src={audioUrl} className="w-full">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      </Modal>
    );
  };

  const abrirPdfModal = (item) => {
    setPdfUrl(item.url);
    setPdfModalTitle(item.name || 'Visor de PDF');
    setPdfModalOpen(true);
  };

  const cerrarPdfModal = () => {
    setPdfUrl('');
    setPdfModalTitle('');
    setPdfModalOpen(false);
  };

  const renderPdfViewerModal = () => {
    if (!pdfModalOpen) return null;
    return (
      <Modal isOpen={pdfModalOpen} onClose={cerrarPdfModal} title={pdfModalTitle}>
        <PdfViewer initialFile={pdfUrl} showPicker={false} />
      </Modal>
    );
  };

  const renderModalEditarLibro = () => {
    if (!libroEditando) return null;

    const TagInput = ({ tags, onTagsChange, tagType, availableTags }) => {
        let spanClass = '';
        let buttonClass = '';
        let placeholder = 'Añadir etiqueta y presionar Enter';

        switch (tagType) {
            case 'video':
                spanClass = 'bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 flex items-center';
                buttonClass = 'ml-1 text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100';
                break;
            case 'audio':
                spanClass = 'bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex items-center';
                buttonClass = 'ml-1 text-green-800 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100';
                break;
            case 'pdf':
                spanClass = 'bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 flex items-center';
                buttonClass = 'ml-1 text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100';
                break;
            default:
                spanClass = 'bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-gray-900 dark:text-gray-300 flex items-center';
                buttonClass = 'ml-1 text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100';
        }

        const handleRemoveTag = (tagToRemove) => {
            onTagsChange(tags.filter(tag => tag !== tagToRemove));
        };

        const handleAdd = (e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                e.preventDefault();
                const newTag = e.target.value.trim();
                if (!tags.includes(newTag)) {
                    onTagsChange([...tags, newTag]);
                    handleAddTag(tagType, newTag); // Add to global list
                }
                e.target.value = '';
            }
        };

        const handleSelectTag = (tag) => {
            if (!tags.includes(tag)) {
                onTagsChange([...tags, tag]);
            }
        };

        return (
            <div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {(tags || []).map(tag => (
                        <span key={tag} className={spanClass}>
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className={buttonClass}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>
                <Input
                    type="text"
                    placeholder={placeholder}
                    onKeyPress={handleAdd}
                    list={`datalist-${tagType}`}
                />
                <datalist id={`datalist-${tagType}`}>
                    {(availableTags || []).map(tag => <option key={tag} value={tag} />)}
                </datalist>
    
                <div className="flex flex-wrap gap-1 mt-2">
                    {(availableTags || []).map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleSelectTag(tag)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full px-2 py-1"
                        >
                           + {tag}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capítulos</label>
            <div className="space-y-2">
              {libroEditando.capitulos.map((capitulo, index) => (
                <div key={capitulo.id} className="grid grid-cols-2 gap-4 items-start">
                  <Input
                    type="text"
                    value={capitulo.titulo}
                    onChange={(e) => {
                      const nuevosCapitulos = [...libroEditando.capitulos];
                      nuevosCapitulos[index].titulo = e.target.value;
                      setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                    }}
                    className="col-span-2"
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Videos</h4>
                    {capitulo.videoItems && capitulo.videoItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                        <Input
                          type="text"
                          placeholder="Nombre del video"
                          value={item.name}
                          onChange={(e) => {
                            const nuevosCapitulos = [...libroEditando.capitulos];
                            nuevosCapitulos[index].videoItems[itemIndex].name = e.target.value;
                            setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="URL del video"
                            value={item.url}
                            onChange={(e) => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].videoItems[itemIndex].url = e.target.value;
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          />
                          <Boton
                            variant="peligro"
                            onClick={() => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].videoItems.splice(itemIndex, 1);
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Boton>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etiquetas</label>
                          <TagInput
                            tags={item.tags || []}
                            onTagsChange={(newTags) => {
                                const nuevosCapitulos = [...libroEditando.capitulos];
                                nuevosCapitulos[index].videoItems[itemIndex].tags = newTags;
                                setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                            tagType="video"
                            availableTags={mediaTags.video}
                          />
                        </div>
                      </div>
                    ))}
                    <Boton
                      variant="secundario"
                      onClick={() => {
                        const nuevosCapitulos = [...libroEditando.capitulos];
                        if (!nuevosCapitulos[index].videoItems) {
                          nuevosCapitulos[index].videoItems = [];
                        }
                        nuevosCapitulos[index].videoItems.push({ name: '', url: '', tags: [] });
                        setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                      }}
                    >
                      <PlusIcon className="h-4 w-4" /> Añadir Video
                    </Boton>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Audios</h4>
                    {capitulo.audioItems && capitulo.audioItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                        <Input
                          type="text"
                          placeholder="Nombre del audio"
                          value={item.name}
                          onChange={(e) => {
                            const nuevosCapitulos = [...libroEditando.capitulos];
                            nuevosCapitulos[index].audioItems[itemIndex].name = e.target.value;
                            setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="URL del audio"
                            value={item.url}
                            onChange={(e) => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].audioItems[itemIndex].url = e.target.value;
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          />
                          <Boton
                            variant="peligro"
                            onClick={() => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].audioItems.splice(itemIndex, 1);
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Boton>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etiquetas</label>
                          <TagInput
                            tags={item.tags || []}
                            onTagsChange={(newTags) => {
                                const nuevosCapitulos = [...libroEditando.capitulos];
                                nuevosCapitulos[index].audioItems[itemIndex].tags = newTags;
                                setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                            tagType="audio"
                            availableTags={mediaTags.audio}
                          />
                        </div>
                      </div>
                    ))}
                    <Boton
                      variant="secundario"
                      onClick={() => {
                        const nuevosCapitulos = [...libroEditando.capitulos];
                        if (!nuevosCapitulos[index].audioItems) {
                          nuevosCapitulos[index].audioItems = [];
                        }
                        nuevosCapitulos[index].audioItems.push({ name: '', url: '', tags: [] });
                        setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                      }}
                    >
                      <PlusIcon className="h-4 w-4" /> Añadir Audio
                    </Boton>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">PDFs</h4>
                    {capitulo.pdfItems && capitulo.pdfItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                        <Input
                          type="text"
                          placeholder="Nombre del PDF"
                          value={item.name}
                          onChange={(e) => {
                            const nuevosCapitulos = [...libroEditando.capitulos];
                            nuevosCapitulos[index].pdfItems[itemIndex].name = e.target.value;
                            setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="URL del PDF"
                            value={item.url}
                            onChange={(e) => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].pdfItems[itemIndex].url = e.target.value;
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          />
                          <Boton
                            variant="peligro"
                            onClick={() => {
                              const nuevosCapitulos = [...libroEditando.capitulos];
                              nuevosCapitulos[index].pdfItems.splice(itemIndex, 1);
                              setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Boton>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etiquetas</label>
                          <TagInput
                            tags={item.tags || []}
                            onTagsChange={(newTags) => {
                                const nuevosCapitulos = [...libroEditando.capitulos];
                                nuevosCapitulos[index].pdfItems[itemIndex].tags = newTags;
                                setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                            }}
                            tagType="pdf"
                            availableTags={mediaTags.pdf}
                          />
                        </div>
                      </div>
                    ))}
                    <Boton
                      variant="secundario"
                      onClick={() => {
                        const nuevosCapitulos = [...libroEditando.capitulos];
                        if (!nuevosCapitulos[index].pdfItems) {
                          nuevosCapitulos[index].pdfItems = [];
                        }
                        nuevosCapitulos[index].pdfItems.push({ name: '', url: '', tags: [] });
                        setLibroEditando({ ...libroEditando, capitulos: nuevosCapitulos });
                      }}
                    >
                      <PlusIcon className="h-4 w-4" /> Añadir PDF
                    </Boton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Boton variant="secundario" onClick={() => setLibroEditando(null)}>Cancelar</Boton>
          <Boton onClick={handleGuardarLibro}>Guardar Cambios</Boton>
        </div>
      </Modal>
    );
  };

  const renderModalGrupoArtesano = () => {
    if (!modalGrupoArtesanoOpen) return null;
  
    const handleArtesanoSelection = (artesanoId) => {
      setGrupoArtesanoEditando(prev => {
        const newArtesanoIds = prev.artesanoIds.includes(artesanoId)
          ? prev.artesanoIds.filter(id => id !== artesanoId)
          : [...prev.artesanoIds, artesanoId];
        return { ...prev, artesanoIds: newArtesanoIds };
      });
    };
  
    return (
      <Modal isOpen={modalGrupoArtesanoOpen} onClose={cerrarModalGrupoArtesano} title={grupoArtesanoEditando?.id ? "Editar Grupo" : "Crear Grupo"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Grupo</label>
            <Input
              type="text"
              value={grupoArtesanoEditando?.nombre || ''}
              onChange={(e) => setGrupoArtesanoEditando({ ...grupoArtesanoEditando, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Artesanos</label>
            <div className="max-h-60 overflow-y-auto border dark:border-gray-600 rounded-md p-2 mt-1 space-y-2">
              {artesanos.filter(a => a.id !== 'multicultural').map(artesano => (
                <label key={artesano.id} className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700/50">
                  <input
                    type="checkbox"
                    checked={grupoArtesanoEditando?.artesanoIds.includes(artesano.id)}
                    onChange={() => handleArtesanoSelection(artesano.id)}
                  />
                  <span className="text-sm font-medium">{artesano.nombre}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Boton variant="secundario" onClick={cerrarModalGrupoArtesano}>Cancelar</Boton>
          <Boton onClick={handleGuardarGrupoArtesano}>Guardar</Boton>
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
                {[{id: 'Mis Libros', icon: <BookOpenIcon className="h-5 w-5" />}, {id: 'Colecciones', icon: <FolderIcon className="h-5 w-5" />}, {id: 'Área de Creación', icon: <CodeBracketIcon className="h-5 w-5" />}, {id: 'Biblioteca', icon: <BuildingLibraryIcon className="h-5 w-5" />}, {id: 'Artesanos', icon: <UsersIcon className="h-5 w-5" />}, {id: 'Visor PDF', icon: <DocumentTextIcon className="h-5 w-5" />}, {id: 'Gestión de Etiquetas', icon: <Cog6ToothIcon className="h-5 w-5" />}].map(item => (
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

  const renderVistaVisorPdf = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Visor de PDF</h2>
      <Card>
        <PdfViewer />
      </Card>
    </div>
  );

  const renderVistaArtesanos = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Artesanos de Contenido</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
          {artesanos.filter(a => a.id !== 'multicultural').map(artesano => (
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

      <hr className="my-8 dark:border-gray-700" />

      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Grupos de Artesanos</h2>
            <Boton onClick={() => abrirModalGrupoArtesano()}> 
              <PlusIcon className="h-5 w-5" /> Crear Nuevo Grupo
            </Boton>
        </div>
        <div className="space-y-4">
            {gruposArtesanos.map(grupo => (
              <Card key={grupo.id}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{grupo.nombre}</h3>
                  <div className="flex gap-2">
                    <Boton variant="secundario" onClick={() => abrirModalGrupoArtesano(grupo)}>Editar</Boton>
                    <Boton variant="peligro" onClick={() => handleEliminarGrupoArtesano(grupo.id)}><TrashIcon className="h-5 w-5" /></Boton>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grupo.artesanoIds.map(id => {
                    const artesano = artesanos.find(a => a.id === id);
                    return (
                      <span key={id} className="bg-gray-200 dark:bg-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                        {artesano ? artesano.nombre : 'Artesano no encontrado'}
                      </span>
                    );
                  })}
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

    const handleIdiomaSelection = (idioma) => {
        setIdiomasSeleccionados(prev => 
          prev.includes(idioma) ? prev.filter(i => i !== idioma) : [...prev, idioma]
        );
      };
      
    const handleGrupoArtesanoChange = (e) => {
        const grupoId = e.target.value;
        if (grupoId === 'ninguno') {
          setArtesanosSeleccionados({});
          return;
        }
        const grupo = gruposArtesanos.find(g => g.id.toString() === grupoId);
        if (grupo) {
          const seleccionados = {};
          artesanos.forEach(a => {
            if (grupo.artesanoIds.includes(a.id)) {
              seleccionados[a.id] = true;
            } else {
                seleccionados[a.id] = false;
            }
          });
          setArtesanosSeleccionados(seleccionados);
        }
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
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Seleccionar Grupo</label>
                    <select onChange={handleGrupoArtesanoChange} className="w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm">
                        <option value="ninguno">Ningún grupo</option>
                        {gruposArtesanos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {artesanos.map(a => (
                      <label key={a.id} className={`flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 ${a.id === 'multicultural' ? 'col-span-full bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                        <input type="checkbox" checked={!!artesanosSeleccionados[a.id]} onChange={e => setArtesanosSeleccionados({...artesanosSeleccionados, [a.id]: e.target.checked})} />
                        <span className="text-sm font-medium">{a.nombre}</span>
                      </label>
                    ))}
                  </div>
                   {artesanosSeleccionados['multicultural'] && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold mb-2">Idiomas para Traducción</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {idiomasDisponibles.map(idioma => (
                          <label key={idioma} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={idiomasSeleccionados.includes(idioma)} onChange={() => handleIdiomaSelection(idioma)} />
                            {idioma}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
                <div className="flex flex-col md:flex-row gap-4">
                  <Boton onClick={handleGenerarContenido} disabled={generandoContenido} className="flex-1">
                    {generandoContenido ? 'Generando...' : 'GENERAR CONTENIDO'}
                  </Boton>
                  <Boton onClick={handleDescargarZip} variant="secundario" disabled={generandoContenido}><ArchiveBoxIcon className="h-5 w-5" /> Descargar (.zip)</Boton>
                </div>
                
                {/* Panel de Resultados */}
                {(generandoContenido || contenidoGenerado.length > 0 || traducciones.length > 0) && (
                  <div className="space-y-4 pt-6">
                    <h3 className="text-xl font-bold">Resultados de Generación</h3>
                    {contenidoGenerado.map((item, index) => (
                      <Card key={index}>
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{item.nombreArtesano}</h4>
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{item.texto}</p>
                      </Card>
                    ))}
                    {traducciones.map((item, index) => (
                        <Card key={index}>
                          <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Traducción: {item.idioma}</h4>
                          <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{item.texto}</p>
                        </Card>
                      ))}
                    {generandoContenido && (
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
      const librosFiltrados = libros.filter(libro => 
        filtroColeccionBiblioteca === 'todas' || 
        (filtroColeccionBiblioteca === 'ninguna' && !libro.collectionId) ||
        (libro.collectionId && libro.collectionId === filtroColeccionBiblioteca)
      );

      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Biblioteca</h2>
            <div className="flex items-center gap-2">
              <FolderIcon className="h-5 w-5 text-gray-500" />
              <select value={filtroColeccionBiblioteca} onChange={e => setFiltroColeccionBiblioteca(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3">
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

    const grupoSeleccionado = gruposArtesanos.find(g => g.id.toString() === grupoArtesanoSeleccionado);
    const artesanosDelGrupo = grupoSeleccionado ? grupoSeleccionado.artesanoIds.map(id => String(id)) : [];

    const contenidoFiltrado = libroSeleccionado.capitulos
    .filter(cap => capituloBibliotecaSeleccionado === 'todos' || cap.id === parseFloat(capituloBibliotecaSeleccionado))
    .map(cap => {
        const contenidos = cap.contenido.filter(cont =>
            (filtroArtesano === 'todos' || String(cont.artesanoId) === filtroArtesano) &&
            (grupoArtesanoSeleccionado === 'todos' || artesanosDelGrupo.includes(String(cont.artesanoId)))
        );
        const traduccionesFiltradas = cap.traducciones ? cap.traducciones.filter(trad =>
            (grupoArtesanoSeleccionado === 'todos' && (filtroArtesano === 'todos' || filtroArtesano === 'multicultural'))
        ) : [];
        return { ...cap, contenidos, traducciones: traduccionesFiltradas };
    }).filter(cap => cap.contenidos.length > 0 || cap.traducciones.length > 0 || (cap.audioItems && cap.audioItems.length > 0) || (cap.videoItems && cap.videoItems.length > 0) || (cap.pdfItems && cap.pdfItems.length > 0));

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
                <option value="todos">Todos los Artesanos</option>
                <option value="base">Texto Base</option>
                {artesanos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <select value={grupoArtesanoSeleccionado} onChange={e => setGrupoArtesanoSeleccionado(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3">
                <option value="todos">Todos los Grupos</option>
                {gruposArtesanos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {contenidoFiltrado.length > 0 ? contenidoFiltrado.map(cap => (
            <div key={cap.id}>
              <div className="flex justify-between items-center border-b-2 border-blue-500 pb-2 mb-4">
                <h3 className="text-xl font-semibold">{cap.titulo}</h3>
                <div className="flex gap-2 flex-wrap">
                  {cap.videoItems && cap.videoItems.map((item, index) => (
                    <Boton key={index} onClick={() => abrirVideoModal(item)} variant="secundario" className="h-auto">
                        <div className="flex flex-col text-left">
                            <span className="flex items-center gap-2"><PlayIcon className="h-5 w-5" /> {item.name || `Video ${index + 1}`}</span>
                            {(item.tags && item.tags.length > 0) && <span className="text-xs opacity-75">{item.tags.join(', ')}</span>}
                        </div>
                    </Boton>
                  ))}
                  {cap.audioItems && cap.audioItems.map((item, index) => (
                    <Boton key={index} onClick={() => abrirAudioModal(item)} variant="secundario" className="h-auto">
                        <div className="flex flex-col text-left">
                            <span className="flex items-center gap-2"><PlayCircleIcon className="h-5 w-5" /> {item.name || `Audio ${index + 1}`}</span>
                            {(item.tags && item.tags.length > 0) && <span className="text-xs opacity-75">{item.tags.join(', ')}</span>}
                        </div>
                    </Boton>
                  ))}
                  {cap.pdfItems && cap.pdfItems.map((item, index) => (
                    <Boton key={index} onClick={() => abrirPdfModal(item)} variant="secundario" className="h-auto">
                        <div className="flex flex-col text-left">
                            <span className="flex items-center gap-2"><DocumentTextIcon className="h-5 w-5" /> {item.name || `PDF ${index + 1}`}</span>
                            {(item.tags && item.tags.length > 0) && <span className="text-xs opacity-75">{item.tags.join(', ')}</span>}
                        </div>
                    </Boton>
                  ))}
                  <Boton onClick={() => handleDescargarCapituloZip(cap)} variant="secundario">
                    <ArchiveBoxIcon className="h-5 w-5" /> Descargar Capítulo
                  </Boton>
                </div>
              </div>
              <div className="space-y-4">
                {cap.contenidos.map((cont, index) => (
                    <Card key={`cont-${index}`}>
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
                ))}
                {cap.traducciones && cap.traducciones.map((trad, index) => (
                    <Card key={`trad-${index}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Traducción: {trad.idioma}</h4>
                        <div className="flex items-center">
                            {trad.fechaCreacion && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mr-4">
                                Generado: {new Date(trad.fechaCreacion).toLocaleString()}
                              </p>
                            )}
                            <button
                              onClick={() => handleCopy(trad.texto)}
                              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                              title="Copiar contenido"
                            >
                              <ClipboardDocumentListIcon className="h-5 w-5" />
                            </button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 mt-2">{trad.texto}</p>
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


  const renderVistaGestionEtiquetas = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Gestión de Etiquetas</h2>

        {/* Video Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de Video</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.video.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('video', tag)}
                  className="ml-1 text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de video"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('video', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('video', document.querySelector('input[placeholder="Nueva etiqueta de video"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>

        {/* Audio Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de Audio</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.audio.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('audio', tag)}
                  className="ml-1 text-green-800 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de audio"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('audio', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('audio', document.querySelector('input[placeholder="Nueva etiqueta de audio"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>

        {/* PDF Tags */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Etiquetas de PDF</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaTags.pdf.map((tag, index) => (
              <span key={index} className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag('pdf', tag)}
                  className="ml-1 text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nueva etiqueta de PDF"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleAddTag('pdf', e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <Boton onClick={() => handleAddTag('pdf', document.querySelector('input[placeholder="Nueva etiqueta de PDF"]').value.trim())}>
              Añadir
            </Boton>
          </div>
        </Card>
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
      {renderModalGrupoArtesano()}
      {renderVideoPlayerModal()}
      {renderAudioPlayerModal()}
      {renderPdfViewerModal()}
      
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
        {vistaActual === 'Visor PDF' && renderVistaVisorPdf()}
        {vistaActual === 'Gestión de Etiquetas' && renderVistaGestionEtiquetas()}
      </main>
    </div>
  );
}

export default App;