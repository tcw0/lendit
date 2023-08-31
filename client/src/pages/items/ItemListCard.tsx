import React from 'react'
import { Card, CardMedia, Typography, Box, CardActionArea } from '@mui/material'
import { useNavigate } from 'react-router-dom'

// icons
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import LocationOnIcon from '@mui/icons-material/LocationOn'

// references
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { intToPrice, displayRating } from 'src/helper/helper'
import lenditLogo from 'src/assets/lenditLogo.png'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'

export default function ItemListCard({ item }: { item: ItemMetaDataDto }) {
  const navigate = useNavigate()

  return (
    <Card sx={{ m: '.5rem', boxShadow: 2 }}>
      <CardActionArea
        onClick={() => {
          navigate(`/items/${item.id}`)
        }}
      >
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          <Box
            sx={{
              flex: '25%',
              display: 'flex',
              justifyContent: 'center',
              aligntItems: 'center',
              m: '1.5em',
              mr: '2rem',
            }}
          >
            <CardMedia
              component="img"
              sx={{
                maxHeight: 150,
                maxWidth: 150,
                alignSelf: 'center',
                borderRadius: '10%',
                objectFit: 'cover',
              }}
              image={item.picture?.url || lenditLogo}
            />
          </Box>

          <Box
            sx={{
              flex: '60%',
              display: 'flex',
              justifyContent: 'flex-start',

              rowGap: '.2rem',
              flexDirection: 'column',
              my: '1rem',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon
                sx={{
                  color: 'grey',
                  fontWeight: 'light',
                  fontSize: 'medium',
                  mb: '.2rem',
                  mr: '.2em',
                }}
              />
              <Typography
                sx={{ fontSize: '1em', color: 'grey', fontWeight: 'light' }}
              >
                {item.location?.zipCode} {item.location?.city}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              {item.title}
            </Typography>
            <Box
              sx={{ fontSize: '1em', display: 'flex', alignItems: 'center' }}
            >
              <StarRateRoundedIcon
                sx={{ fontSize: 'medium', mb: '.2em', mr: '.2em' }}
              />
              <Typography>{displayRating(item?.avgRating)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '1.25em', fontWeight: 'bold' }}>
              {intToPrice(item.priceFirstDay)} first day
            </Typography>
            <Typography sx={{ fontSize: '1.1em', color: 'grey' }}>
              {intToPrice(item.pricePerDay)} per extra day
            </Typography>
          </Box>

          <Box
            sx={{
              flex: '15%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              m: '1.25rem',
            }}
          >
            <LabeledOrPicturedAvatar
              sx={{
                height: 70,
                width: 70,
                margin: '0.5em',
              }}
              userName={item.lenderName ? item.lenderName : '?'}
              userProfilePicUrl={
                item.lenderPicture?.url ? item.lenderPicture?.url : undefined
              }
              variant="circular"
            />
            <Typography sx={{ fontSize: '1rem', textAlign: 'center' }}>
              {item.lenderName}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
