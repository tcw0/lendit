import React, { useContext } from 'react'
import { Box } from '@mui/material'
import PageRoutes from './Routes'
import Navbar from './components/Navbar'
import LoginSignup from './components/loginSignup/LoginSignup'
import { AuthContext } from './context/AuthContext'
import CompleteProfile from './components/firstLogin/CompleteProfile'
import 'mapbox-gl/dist/mapbox-gl.css'

function App() {
  const { openLogin, setOpenLogin, firstLogin, setFirstLogin } =
    useContext(AuthContext)

  return (
    <>
      <Navbar />
      <Box sx={{ marginTop: '100px' }}>{PageRoutes()}</Box>
      <LoginSignup openLogin={openLogin} setOpenLogin={setOpenLogin} />
      <CompleteProfile
        openCompleteProfile={firstLogin}
        setOpenCompleteProfile={setFirstLogin}
      />
    </>
  )
}

export default App
