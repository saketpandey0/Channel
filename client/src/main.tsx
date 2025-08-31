import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppbarClient } from './components/AppbarClient.tsx'
import { Providers } from './Providers.tsx'
import { Container } from './components/Shad/ui/container.tsx'
import { Appbar } from './components/Appbar.tsx'
import { useLocation } from 'react-router-dom'



const hiddenNavbarRoutes = ['/editor', '/admin'];

function Layout() {
  const location = useLocation();

  const shouldHideNavbar = hiddenNavbarRoutes.includes(location.pathname);

  return (
    <Container className="md:flex md:items-center md:w-auto">
      {!shouldHideNavbar && <Appbar />}
    </Container>
  );
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Layout/>
      <App />
    </Providers>
  </StrictMode>,
)
