import * as React from 'react'

// mui components
import { IconButton } from '@mui/material'

// mui icons
import CloseIcon from '@mui/icons-material/Close'

export default function CloseButton({
  handleClose,
}: {
  handleClose: () => void
}) {
  return (
    <IconButton
      aria-label="close"
      onClick={handleClose}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
      }}
    >
      <CloseIcon />
    </IconButton>
  )
}
