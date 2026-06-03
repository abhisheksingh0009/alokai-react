import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { NavigationProvider } from './context/NavigationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <NavigationProvider>
  <StrictMode>
    <App />
  </StrictMode>
  </NavigationProvider>
)
