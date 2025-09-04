import { Auth } from './components/Auth/Auth';
import { LandingPage } from './screens/LandingPage'
import { Routes, Route } from "react-router-dom";
import { StoriesLayout } from './components/Story/StoriesLayout';
import { Write } from './components/Editor/Write';
// import Statsboard from './components/Analytics/Statsboard';
import { ProfileWrapper } from './components/Profile/ProfileWrapper';
// import ContentWrapper from './components/searchContenet/ContentWrapper';
import PublicationPage from './components/Publication/PublicationPage';
import { AdminWrapper } from './components/Admin/AdminWrapper';
import Publications from './components/Publication/Publications';
import AdminRoute from './components/Admin/AdminRoute';
// import ResultContent from './components/SearchContenet/ResultContent';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stories" element={<StoriesLayout />} />
        {/* <Route path="/stats" element={<Statsboard />} /> */}
        <Route path="/:username/:tab?" element={<ProfileWrapper />} />
        {/* <Route path="/:username/:tab?" element={<ContentWrapper />} /> */}
        {/* <Route path='/result/content' element={<ResultContent/>}></Route> */}
        <Route path="/admin" element={<AdminRoute><AdminWrapper /></AdminRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/publication/:id" element={<PublicationPage  />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/editor" element={<Write />} />     
      </Routes>
  )
}

export default App
