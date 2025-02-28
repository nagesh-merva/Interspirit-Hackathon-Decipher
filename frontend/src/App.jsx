import React from "react"
import Register from "./pages/register"
import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Nevbar from "./components/Nevbar"
function App() {

  return (
    <div className="md:flex justify-center items-center h-screen w-full ">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nevbar" element={<Nevbar />} />
      </Routes>
    </div>
  )
}

export default App