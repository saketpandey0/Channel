import { Auth } from './components/Auth/Signin';
import { Dashboard } from './screens/Dashboard'
import { Routes, Route } from "react-router-dom";
import {EmailAuth} from './components/Auth/EmailAuth'
import {Stories} from './components/Stories'

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth/signin" element={<Auth type='signin' />} />
        <Route path="/auth/email" element={<EmailAuth/>}></Route>
        <Route path='/stories' element={<Stories/>}></Route>
      </Routes>
  )
}

export default App
