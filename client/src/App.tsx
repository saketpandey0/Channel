import { Auth } from './components/Auth/Auth';
import { LandingPage } from './screens/LandingPage'
import { Routes, Route } from "react-router-dom";
import { StoriesLayout } from './components/Story/StoriesLayout';
import { Write } from './components/Editor/Write';
import Statsboard from './components/Analytics/Statsboard';
import { ProfileWrapper } from './components/Profile/ProfileWrapper';
// import ContentWrapper from './components/searchContenet/ContentWrapper';
import PublicationPage from './pages/PublicationPage';
import { AdminWrapper } from './components/Admin/AdminWrapper';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stories" element={<StoriesLayout />} />
        <Route path="/stats" element={<Statsboard />} />
        <Route path="/:username/:tab?" element={<ProfileWrapper />} />
        {/* <Route path="/:username/:tab?" element={<ContentWrapper />} /> */}
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/publication/:id" element={<PublicationPage  />} />
        <Route path="/editor" element={<Write />} />        
      </Routes>
  )
}

export default App
