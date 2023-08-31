import { Close } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import React from 'react'

type PictureModalProps = {
  open: boolean
  handleClose: () => void
  pictureUrl: string
}

export default function PictureModal(props: PictureModalProps): JSX.Element {
  const { open, handleClose, pictureUrl } = props
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="subtitle1">Picture</Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <Box
        component="img"
        src={pictureUrl}
        sx={{
          width: '90%',
          m: '5%',
        }}
      />
    </Dialog>
  )
}
