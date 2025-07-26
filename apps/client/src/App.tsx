import { Auth } from './components/AuthComp/Auth';
import { LandingPage } from './screens/LandingPage'
import { Routes, Route } from "react-router-dom";
import {EmailAuth} from './components/AuthComp/EmailAuth'
import { StoriesLayout } from './components/StoriesLayout';
import StoryCard from './components/StoryCard';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stories" element={<StoriesLayout />} />
        <Route path="/story" element={<StoryCard />} />
        <Route path="/auth/signin" element={<Auth />} />
        <Route path="/auth/signup" element={<Auth />} />
        <Route path="/auth/email/signin" element={<EmailAuth type='signin'/>}></Route>
        <Route path="/auth/email/signup" element={<EmailAuth type='signup'/>}></Route>

      </Routes>
  )
}

export default App
