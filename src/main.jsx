import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Vite runtime → safe here; Jest doesn't import main.jsx
window.__APP_ENDPOINT__ = 'https://demo-app.free.beeceptor.com';


createRoot(document.getElementById('root')).render(<App />)
