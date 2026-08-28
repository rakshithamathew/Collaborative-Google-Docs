import { Navigate, Route, Routes } from 'react-router-dom'
import { DocumentsPage } from './pages/DocumentsPage'
import { DocumentPage } from './pages/DocumentPage'

function App() {
  return (
    <Routes>
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/:id" element={<DocumentPage />} />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  )
}

export default App
