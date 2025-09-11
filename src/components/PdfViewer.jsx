import { useState } from 'react';
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

  return (
    <div>
      {showPicker && (
        <div className="mb-4">
          <label htmlFor="file">Cargar desde archivo:</label>{' '}
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
      <div className="flex justify-center">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <div className="flex justify-center border border-gray-300 dark:border-gray-600">
            <Page pageNumber={pageNumber} />
          </div>
        </Document>
      </div>
    </div>
  );
}
