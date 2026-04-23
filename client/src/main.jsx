import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e2433',
          color: '#e2e8f0',
          border: '1px solid #2d3748',
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e2433' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1e2433' } },
      }}
    />
  </React.StrictMode>,
)
