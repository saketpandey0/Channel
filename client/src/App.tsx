import { Auth } from './components/Auth/Auth';
import { LandingPage } from './screens/LandingPage'
import { Routes, Route } from "react-router-dom";
import { StoriesLayout } from './components/story/StoriesLayout';
import { Write } from './pages/Write';
import { Notification } from './pages/notification';
import Statsboard from './components/Analytics/Statsboard';
import { ProfileWrapper } from './components/profile/ProfileWrapper';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stories" element={<StoriesLayout />} />
        <Route path="/stats" element={<Statsboard />} />
        <Route path="/:username/:tab?" element={<ProfileWrapper />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/editor" element={<Write />} />
        <Route path="/notification" element={<Notification />} />
      </Routes>
  )
}

export default App
