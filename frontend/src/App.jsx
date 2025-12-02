import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import Home from './components/Home'
import LandingPage from './components/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Nav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
