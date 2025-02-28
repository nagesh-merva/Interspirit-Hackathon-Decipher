import React from "react"
import Register from "./pages/register"
import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Dashboard from "./pages/Dashboard"
import SentimentTrends from "./pages/SentimentTrends"
import LandingPage from "./pages/Home"
function App() {

  return (
    <div className="md:flex justify-center items-center h-screen w-full">
      <Routes>
        <Route index path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sentiment" element={<SentimentTrends />} />

      </Routes>
    </div>
  )
}

export default App