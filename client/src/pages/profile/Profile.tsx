import React from 'react'
import Footer from 'src/components/Footer'
import { Box, Tab, Tabs } from '@mui/material'
import AddressTab from './profiletabs/addressTab/AddressTab'
import SettingsTab from './profiletabs/settingsTab/SettingsTab'
import PersonalInfoTab from './profiletabs/PersonalInfoTab/PersonalInfoTab'
import PaymentTab from './profiletabs/PaymentTab/PaymentTab'

export default function Profile() {
  const [selectedTab, setSelectedTab] = React.useState(0)

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  return (
    <>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '100vw',
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Personal info" />
          <Tab label="Payment" />
          <Tab label="Address" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      {/* Render corresponding content based on selectedTab */}
      {selectedTab === 0 && <PersonalInfoTab />}
      {selectedTab === 1 && <PaymentTab />}
      {selectedTab === 2 && <AddressTab />}
      {selectedTab === 3 && <SettingsTab />}
      <Footer />
    </>
  )
}
