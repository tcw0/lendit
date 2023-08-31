import React from 'react'

// mui components
import {
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
} from '@mui/material'

// mui icons
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import LocationOnIcon from '@mui/icons-material/LocationOn'

// references
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { intToPrice, displayRating } from 'src/helper/helper'
import lenditLogo from 'src/assets/lenditLogo.png'
import { useNavigate } from 'react-router-dom'

/**
 * ItemCard of item
 * @param item instance of ItemMetaDataDto
 */
function ItemCard({ item }: { item: ItemMetaDataDto }) {
  const cardWidth = 300
  const navigate = useNavigate()

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
          navigate(`/items/${item.id}`)
        }}
        sx={{
          height: '100%',
        }}
      >
        <CardMedia
          sx={{
            height: cardWidth * 0.95,
            width: '100%',
            objectFit: 'fill',
            borderRadius: '0.5rem',
          }}
          image={item.picture?.url || lenditLogo}
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
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box sx={{ fontSize: 16, fontWeight: 'bold', height: '48px' }}>
              {item.title}
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <StarRateRoundedIcon sx={{ mt: '-4px' }} />
              <Box sx={{ fontWeight: 'bold', ml: '4px' }}>
                {displayRating(item.avgRating)}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Box
              sx={{
                color: '#717171',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LocationOnIcon sx={{ fontSize: 15 }} />
              {item.location?.zipCode} {item.location?.city}
            </Box>
            <Box sx={{ color: '#717171', mb: 2 }}>{item.lenderName}</Box>
            <Box sx={{ fontSize: 16, fontWeight: 'bold' }}>
              {intToPrice(item.priceFirstDay)} first day
            </Box>
            <Box sx={{ color: '#717171' }}>
              {intToPrice(item.pricePerDay)} per extra day
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ItemCard
