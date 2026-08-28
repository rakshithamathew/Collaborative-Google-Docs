import { Navigate, Route, Routes } from 'react-router-dom'
import { DocumentsPage } from './pages/DocumentsPage'
import { DocumentPage } from './pages/DocumentPage'

function App() {
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
