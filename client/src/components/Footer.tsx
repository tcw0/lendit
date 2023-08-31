import { Box, Stack, Typography, Divider } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        width: '100vw',
        backgroundColor: 'white',
      }}
    >
      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        px={5}
        my={2}
        flexWrap="wrap"
      >
        <Typography
          variant="body1"
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => navigate('/about')}
        >
          About Us
        </Typography>
        <Typography variant="body1">© 2023 lendit</Typography>
        <Typography
          variant="body1"
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => navigate('/about')}
        >
          Imprint
        </Typography>
      </Stack>
    </Box>
  )
}

export default Footer
