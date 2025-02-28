import React from "react"
import Register from "./pages/register"
import { Routes, Route } from "react-router-dom"
function App() {

  return (
    <div className="md:flex justify-center items-center h-full w-full ">
      <Routes>
        <Route path="/register" element={<Register />} />

      </Routes>
    </div>
  )
}

export default App