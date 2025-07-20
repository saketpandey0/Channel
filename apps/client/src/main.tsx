import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Appbar } from './components/Appbar.tsx'
import { Providers } from './Providers.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Appbar></Appbar>
      <App />
    </Providers>
  </StrictMode>,
)
