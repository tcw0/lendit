import React from 'react'

// mui components
import { Box, Typography, useTheme, Button } from '@mui/material'

import onboardingBackground from '../../assets/onboarding.jpg'
import lenditLogo from '../../assets/lenditLogo.png'
import { AuthContext } from '../../context/AuthContext'
import MoreInformation from './MoreInformation'

export default function Onboarding() {
  const theme = useTheme()
  const authContext = React.useContext(AuthContext)

  const [openMoreInformation, setOpenMoreInformation] = React.useState(false)

  return (
    <>
      <Box
        sx={{
          width: '100%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            minWidth: '100%',
            height: '100%',
            backgroundImage: `url(${onboardingBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(50%)',
            zIndex: -1,
          }}
        />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            py: '5%',
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            mx={10}
            columnGap={1}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              noWrap
              sx={{
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              share it.
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              noWrap
              sx={{
                color: '#B9B9B9',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              rent it.
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            noWrap
            sx={{
              color: theme.palette.secondary.main,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            lendit.
          </Typography>
          <Typography
            maxWidth={470}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              textAlign: 'center',
              p: '10px',
              m: '10px',
              boxShadow: 5,
            }}
          >
            lendit is a sharing platform to lend unused items, help others
            complete their projects, and earn money while promoting
            sustainability by connecting with a like-minded local community
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="center"
            alignItems={{ xs: 'center', sm: 'end' }}
            flexWrap="wrap-reverse"
            width="100%"
            columnGap={7}
            pt={3}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{
                my: 2,
                fontSize: 20,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
              onClick={() => {
                if (!authContext.authToken) {
                  authContext.setOpenLogin(true)
                }
              }}
            >
              Join us now
            </Button>
            <Box
              component="img"
              src={lenditLogo}
              sx={{
                objectFit: 'cover',
                height: 100,
                width: 100,
                borderRadius: '8px',
                my: '5px',
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{
                my: 2,
                fontSize: 20,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setOpenMoreInformation(true)}
            >
              More info
            </Button>
          </Box>
        </Box>
      </Box>
      <MoreInformation
        openMoreInformation={openMoreInformation}
        setOpenMoreInformation={setOpenMoreInformation}
      />
    </>
  )
}
