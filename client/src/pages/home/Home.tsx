import React from 'react'

import Footer from 'src/components/Footer'
import Categories from './Categories'
import Onboarding from './Onboarding'
import { AuthContext } from '../../context/AuthContext'

export default function Home() {
  const authContext = React.useContext(AuthContext)
  return (
    <>
      {!authContext.authToken && <Onboarding />}
      <Categories />
      <Footer />
    </>
  )
}
