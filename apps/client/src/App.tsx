import { Auth } from './components/AuthComp/Auth';
import { Dashboard } from './screens/Dashboard'
import { Routes, Route } from "react-router-dom";
import {EmailAuth} from './components/AuthComp/EmailAuth'
import {Stories} from './components/Stories'

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth/signin" element={<Auth />} />
        <Route path="/auth/signup" element={<Auth />} />
        <Route path="/auth/email/signin" element={<EmailAuth type='signin'/>}></Route>
        <Route path="/auth/email/signup" element={<EmailAuth type='signup'/>}></Route>
        <Route path='/stories' element={<Stories/>}></Route>
      </Routes>
  )
}

export default App
