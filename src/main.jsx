import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
// Importar el interceptor ULTRA DEFINITIVO (debe ir antes de cualquier otro código)
import './interceptor-ultra-definitivo'
import App from './App'
import './assets/css/main.css'
import './assets/css/mobile-responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)