import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Nav from './components/Nav'
import Home from './components/Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Nav></Nav>
      <Home></Home>
    </div>
  )
}

export default App
