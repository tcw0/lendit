import React from 'react'
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RentalMetadataDto } from '@api/models/RentalMetadataDto'
import lenditLogo from 'src/assets/lenditLogo.png'

type LastItemCardProps = {
  rental: RentalMetadataDto
}

export default function LastItemCard(props: LastItemCardProps) {
  const { rental } = props
  const navigate = useNavigate()
  const cardWidth = 200

  return (
    <Card
      sx={{
        width: cardWidth,
        backgroundColor: 'white',
        alignItems: 'stretch',
      }}
    >
      <CardActionArea
        onClick={() => {
          navigate(`/rentals/${rental.id}`)
        }}
      >
        <CardMedia
          sx={{
            height: cardWidth * 1.2,
            width: '100%',
            objectFit: 'cover',
            borderRadius: '0.5rem',
          }}
          image={rental.itemPicture.url ? rental.itemPicture.url : lenditLogo}
          component="img"
        />
        <CardContent
          sx={{
            boxSizing: 'border-box',
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Box sx={{ fontSize: 16, fontWeight: 'bold' }}>
              {rental.itemName}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="body2" sx={{ mb: 2 }}>
              {rental.lenderName}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
