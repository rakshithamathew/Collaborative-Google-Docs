import { Navigate, Route, Routes } from 'react-router-dom'
import { DocumentsPage } from './pages/DocumentsPage'
import { DocumentPage } from './pages/DocumentPage'
import { API_BASE_URL } from './services/api';

function App() {
  useEffect(() => {
    console.log('API URL:', API_BASE_URL);
    // Should log: https://collaborative-google-docs.onrender.com
  }, []);
  return (
    <Routes>
      <Route path="/" element={<DocumentsPage />} />
      <Route path="/documents" element={<Navigate to="/" replace />} />
      <Route path="/documents/:id" element={<DocumentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
