import React from 'react'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  Typography,
  Tooltip,
  SxProps,
  Theme,
  Stack,
} from '@mui/material'
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import { useNavigate } from 'react-router-dom'

import lenditLogo from 'src/assets/lenditLogo.png'
import CloseButton from 'src/components/buttons/CloseButton'
import { displayRating, intToPrice } from 'src/helper/helper'
import FeaturedBooking from 'src/pages/additem/FeaturedBooking'
import { ItemsService } from '@api/services/ItemsService'
import { useSnackbar } from 'src/context/SnackbarContext'
import AddItem from '../../../additem/AddItem'

type LastItemCardProps = {
  item: ItemMetaDataDto
  updateItem: (item: ItemMetaDataDto) => void
  sx?: SxProps<Theme>
}

export default function LastItemCard(props: LastItemCardProps) {
  const { item, updateItem, sx } = props
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()
  const navigate = useNavigate()
  const cardWidth = 200

  const [openEdit, setOpenEdit] = React.useState(false)
  const [openFeatured, setOpenFeatured] = React.useState(false)
  const [deleted, setDeleted] = React.useState(false)

  const handleCloseEdit = async () => {
    setOpenEdit(false)
    try {
      const newItemValue = await ItemsService.getItemMetadata(item.id)
      updateItem(newItemValue)
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  const handleCloseFeatured = () => {
    setOpenFeatured(false)
  }

  const handleDelete = async () => {
    await ItemsService.deleteItemById(item.id)
    item.title = 'Deleted'
    item.picture.url = lenditLogo
    item.avgRating = { avgRating: 0, count: 0 }
    item.location = {
      city: '',
      zipCode: '',
      id: '',
      street: '',
      latitude: 0,
      longitude: 0,
    }
    item.priceFirstDay = 0
    item.pricePerDay = 0
    updateItem(item)
    setDeleted(true)
    showSnackBarWithMessage('Item deleted', 'success')
  }

  return (
    <>
      <Card
        sx={{
          ...sx,
          width: cardWidth,
          backgroundColor: 'white',
          alignItems: 'stretch',
          position: 'relative',
          opacity: deleted ? 0.5 : 1,
        }}
      >
        <IconButton
          onClick={() => setOpenEdit(true)}
          disabled={deleted}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            p: '2px',
            m: '4px',
            backgroundColor: 'rgba(175, 175, 175, 1)',
            color: 'black',
            '&:hover': {
              backgroundColor: 'rgba(200, 200, 200, 1)',
            },
          }}
        >
          <EditIcon sx={{ fontSize: '20px' }} />
        </IconButton>
        <IconButton
          onClick={handleDelete}
          disabled={deleted}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1,
            p: '2px',
            m: '4px',
            backgroundColor: 'rgba(175, 175, 175, 1)',
            color: 'black',
            '&:hover': {
              backgroundColor: 'rgba(200, 200, 200, 1)',
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: '20px' }} />
        </IconButton>
        <Tooltip title="Feature item">
          <IconButton
            onClick={() => (deleted ? undefined : setOpenFeatured(true))}
            sx={{
              position: 'absolute',
              top: '4px',
              zIndex: 1,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'primary.main',
              backgroundColor: 'secondary.main',
              '&:hover': {
                color: 'secondary.main',
                backgroundColor: 'primary.main',
              },
              boxShadow: 10,
            }}
          >
            <ElectricBoltIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        </Tooltip>
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
              height: cardWidth * 1.2,
              width: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
            }}
            image={item.picture?.url || lenditLogo}
            component="img"
          />
          <CardContent
            sx={{
              boxSizing: 'border-box',
              alignItems: 'stretch',
            }}
          >
            <Stack direction="column" spacing={1}>
              <Box sx={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarRateRoundedIcon sx={{ mt: '-4px' }} />
                <Box sx={{ fontWeight: 'bold', ml: '4px' }}>
                  {displayRating(item.avgRating)}
                </Box>
              </Box>
            </Stack>

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
      <Dialog
        maxWidth="md"
        open={openEdit}
        onClose={handleCloseEdit}
        PaperProps={{
          sx: {
            width: '900px',
            mx: 0,
          },
        }}
      >
        <DialogTitle>
          <Typography
            component={Typography}
            variant="h5"
            align="center"
            fontWeight="bold"
          >
            Edit item
          </Typography>
          <CloseButton handleClose={handleCloseEdit} />
        </DialogTitle>
        <AddItem itemId={item.id} handleClose={handleCloseEdit} />
      </Dialog>
      <Dialog
        maxWidth="md"
        open={openFeatured}
        onClose={handleCloseFeatured}
        PaperProps={{
          sx: {
            width: '900px',
            p: 4,
            pt: 0,
          },
        }}
      >
        <DialogTitle>
          <Typography
            component={Typography}
            variant="h5"
            align="center"
            fontWeight="bold"
          >
            Feature your item
          </Typography>
          <CloseButton handleClose={handleCloseFeatured} />
        </DialogTitle>
        <FeaturedBooking itemId={item.id} />
      </Dialog>
    </>
  )
}

LastItemCard.defaultProps = {
  sx: {},
}
