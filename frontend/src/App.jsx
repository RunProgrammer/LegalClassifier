import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'

const Home = lazy(() => import('./components/Home'))
const LandingPage = lazy(() => import('./components/LandingPage'))

const RouteFallback = () => (
  <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-900 px-6 text-slate-200">
    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 px-6 py-4 text-sm">
      Loading workspace...
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Nav />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
