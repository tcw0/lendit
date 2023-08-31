import * as React from 'react'

// mui components
import { IconButton } from '@mui/material'

// mui icons
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

export default function BackButton({ handleBack }: { handleBack: () => void }) {
  return (
    <IconButton
      aria-label="back"
      onClick={handleBack}
      sx={{
        position: 'absolute',
        left: 8,
        top: 8,
      }}
    >
      <ArrowBackIosNewIcon />
    </IconButton>
  )
}
