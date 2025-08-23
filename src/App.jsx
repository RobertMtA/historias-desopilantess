import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Historias from './pages/Historias'
import Galeria from './pages/Galeria'
import Categorias from './pages/Categorias'
import About from './pages/About'
import Contacto from './pages/Contacto'

// Admin Components
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import HistoriaForm from './pages/admin/HistoriaForm'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Header />
            <main><Home /></main>
            <Footer />
          </>
        } />
        <Route path="/historias" element={
          <>
            <Header />
            <main><Historias /></main>
            <Footer />
          </>
        } />
        <Route path="/galeria" element={
          <>
            <Header />
            <main><Galeria /></main>
            <Footer />
          </>
        } />
        <Route path="/categorias" element={
          <>
            <Header />
            <main><Categorias /></main>
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Header />
            <main><About /></main>
            <Footer />
          </>
        } />
        <Route path="/contacto" element={
          <>
            <Header />
            <main><Contacto /></main>
            <Footer />
          </>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/historias/nueva" element={<HistoriaForm />} />
        <Route path="/admin/historias/:id/editar" element={<HistoriaForm />} />
      </Routes>
    </Router>
  )
}

export default App