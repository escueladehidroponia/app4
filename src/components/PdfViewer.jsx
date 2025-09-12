import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();



export default function PdfViewer({ initialFile = '/sample.pdf', showPicker = true }) {
  const [file, setFile] = useState(initialFile);
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const viewerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function onFileChange(event) {
    const newFile = event.target.files[0];
    if (newFile) {
        setFile(newFile);
        setPageNumber(1); // Reset to first page
    }
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  function goToNextPage() {
    setPageNumber(prevPageNumber => (prevPageNumber < numPages ? prevPageNumber + 1 : prevPageNumber));
  }

  function goToPreviousPage() {
    setPageNumber(prevPageNumber => (prevPageNumber > 1 ? prevPageNumber - 1 : prevPageNumber));
  }

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 3.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      viewerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const newIsFullscreen = document.fullscreenElement === viewerRef.current;
      setIsFullscreen(newIsFullscreen);
      // Adjust scale when entering/exiting fullscreen
      if (newIsFullscreen) {
        setScale(1.5); // Or calculate a more dynamic scale
      } else {
        setScale(1.0);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={viewerRef} className={`relative ${isFullscreen ? 'w-screen h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center' : ''}`}>
      {showPicker && (
        <div className="mb-4">
          <label htmlFor="file">Cargar desde archivo:</label> {' '}
          <input onChange={onFileChange} type="file" className="ml-2" />
        </div>
      )}
      <div className="flex items-center justify-center gap-4 my-4">
        <button onClick={goToPreviousPage} disabled={pageNumber <= 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          Anterior
        </button>
        <span>
          Página {pageNumber} de {numPages || '--'}
        </span>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          Siguiente
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 my-2">
        <button onClick={zoomOut} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          Zoom -
        </button>
        <button onClick={resetZoom} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          Reset Zoom ({Math.round(scale * 100)}%)
        </button>
        <button onClick={zoomIn} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          Zoom +
        </button>
        <button onClick={toggleFullscreen} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
          {isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
        </button>
      </div>
      <div className="flex justify-center flex-grow overflow-auto">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <div className="flex justify-center border border-gray-300 dark:border-gray-600">
            <Page pageNumber={pageNumber} scale={scale} />
          </div>
        </Document>
      </div>
    </div>
  );
}

