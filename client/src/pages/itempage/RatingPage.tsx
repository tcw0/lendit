import React from 'react'
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Rating,
  Menu,
  MenuItem,
} from '@mui/material'
import { sortBy } from 'lodash'

// icons
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

// src
import CloseButton from 'src/components/buttons/CloseButton'
import { ItemDto } from '@api/models/ItemDto'
import { RatingDto } from '@api/models/RatingDto'
import { UserMetaDataDto } from '@api/models/UserMetaDataDto'

type RatingPageProps = {
  property: ItemDto | UserMetaDataDto
  ratings: RatingDto[]
  showAllRatings: boolean
  setShowAllRatings: (showAllRatings: boolean) => void
}

export default function RatingPage({
  property,
  ratings,
  showAllRatings,
  setShowAllRatings,
}: RatingPageProps) {
  const [starCounts, setStarCounts] = React.useState<number[]>([])
  const [selectedStars, setSelectedStars] = React.useState<number>(6) // 6 as first unused number for stars
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [sort, setSort] = React.useState<string>('Newest')
  const open = Boolean(anchorEl)

  // to map stars
  const stars: number[] = [5, 4, 3, 2, 1]

  // count how many reviwes per star option
  React.useEffect(() => {
    const countStarRatigns = () => {
      const stars: number[] = [0, 0, 0, 0, 0, 0]
      if (ratings) {
        ratings.forEach(rating => {
          stars[rating.stars] += 1
        })
      }
      setStarCounts(stars)
    }
    countStarRatigns()
  }, [ratings])

  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event?.currentTarget)
  }

  const [sortedRatings, setSortedRatings] = React.useState<RatingDto[]>()

  React.useEffect(() => {
    const createSortedArray = () => {
      if (sort === 'Newest') {
        setSortedRatings(sortBy(ratings, rating => -new Date(rating.time)))
      }

      if (sort === 'Oldest') {
        setSortedRatings(sortBy(ratings, rating => new Date(rating.time)))
      }
    }
    createSortedArray()
  }, [ratings, sort])

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={showAllRatings}
      onClose={() => {
        setShowAllRatings(false)
      }}
    >
      <DialogTitle>
        <CloseButton
          handleClose={() => {
            setShowAllRatings(false)
          }}
        />
      </DialogTitle>
      <DialogContent>
        {/* Rating Bar with stars and count of reviews */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mx: '1rem',
            fontSize: '1.25rem',
          }}
        >
          <StarRateRoundedIcon
            sx={{ fontSize: '1.5em', marginRight: '.2em', mb: '.2em' }}
          />
          <Typography sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            {property?.avgRating.avgRating.toFixed(2)}
          </Typography>
          <FiberManualRecordIcon sx={{ fontSize: '.5em', mx: '.75em' }} />
          <Typography sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            {property?.avgRating.count}{' '}
            {property?.avgRating.count === 1 ? 'Review' : 'Reviews'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: '1rem',
              justifyContent: 'flex-start',
            }}
          >
            {stars.map(star => (
              <Box key={star} sx={{ display: 'flex' }}>
                <IconButton
                  disableRipple
                  sx={{ p: '0.2rem' }}
                  onClick={() => setSelectedStars(star)}
                >
                  <Rating
                    value={star}
                    readOnly
                    sx={{ mr: '.5rem' }}
                    disabled={
                      selectedStars !== 6 ? selectedStars !== star : false
                    }
                  />
                  <Typography>{starCounts[star]}</Typography>
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              mx: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              py: '1rem',
            }}
          >
            <Button
              sx={{
                border: 1,
                borderRadius: '.5rem',
                my: '1rem',
                textTransform: 'none',
              }}
              onClick={() => {
                setSelectedStars(6)
              }}
            >
              <Typography sx={{ fontSize: '1rem', px: '1rem' }}>
                Show all
              </Typography>
            </Button>

            <Button
              sx={{
                border: 1,
                borderRadius: '.5rem',
                my: '1rem',
                textTransform: 'none',
              }}
              onClick={handleFilterOpen}
            >
              <Typography>{sort}</Typography>
              <KeyboardArrowDownIcon sx={{ ml: '.25rem' }} />
            </Button>
            <Menu
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              open={open}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
            >
              <MenuItem
                onClick={() => {
                  handleFilterClose()
                  setSort('Newest')
                }}
              >
                Newest
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleFilterClose()
                  setSort('Oldest')
                }}
              >
                Oldest
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Box for content */}
        <Box
          sx={{
            mt: '2rem',
            mx: '1rem',
            py: '1rem',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderTop: 2,
            borderColor: '#D3D3D3',
          }}
        >
          {sortedRatings &&
            sortedRatings.map(
              rating =>
                (rating.stars === selectedStars || selectedStars === 6) && (
                  <React.Fragment key={rating.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        my: '.75rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <LabeledOrPicturedAvatar
                          sx={{ height: '3.5rem', width: '3.5rem' }}
                          userName={rating.authorName}
                          userProfilePicUrl={rating.authorPicture?.url}
                          variant="circular"
                        />

                        <Box sx={{ mx: '.5rem' }}>
                          <Typography>{rating.authorName}</Typography>
                          <Typography>
                            {new Date(rating.time)
                              .toLocaleDateString(undefined, {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              .replaceAll('/', '.')}
                          </Typography>
                          <Rating value={rating.stars} readOnly />
                        </Box>
                      </Box>

                      <Box sx={{ mx: '1rem', mt: '.5rem' }}>
                        <Typography>{rating.text}</Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                ),
            )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
