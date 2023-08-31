import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home'
import Items from './pages/items/Items'
import AddItem from './pages/additem/AddItem'
import Profile from './pages/profile/Profile'
import Rentals from './pages/rentals/Rentals'
import ItemPage from './pages/itempage/ItemPage'
import VerificationPage from './pages/verification/VerificationPage'
import About from './pages/about/About'

export default function PageRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/items" element={<Items />} />
      <Route path="/items/:itemID" element={<ItemPage />} />
      <Route path="/items/additem" element={<AddItem />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/rentals/:rentalID" element={<Rentals />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route
        path="/verify/:userID/:verificationID"
        element={<VerificationPage />}
      />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
