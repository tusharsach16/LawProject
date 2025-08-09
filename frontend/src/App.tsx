import Signin from "./pages/Signin"
import SignUp from "./pages/SignUp"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard1 from "./pages/Dashboard1";
import Home from './pages/Home';
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/signin" element={<Signin/>}/>
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/dashboard1" element={<Dashboard1/>}/>

      </Routes>
    </BrowserRouter>
    </>    
  )
}

export default App
