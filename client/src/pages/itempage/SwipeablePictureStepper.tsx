import React from 'react'
import { Box, Button, CardMedia, MobileStepper } from '@mui/material'
import SwipeableViews from 'react-swipeable-views'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'
import lenditLogo from 'src/assets/lenditLogo.png'
import { ItemDto } from '@api/models/ItemDto'

type SwipeablePictureStepperProps = {
  item: ItemDto
  setShowAllPictures: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SwipeablePictureStepper({
  item,
  setShowAllPictures,
}: SwipeablePictureStepperProps) {
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        maxWidth: '350px',
        flexDirection: 'column',
        m: '1rem',
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', height: '90%', alignItems: 'center' }}>
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {item?.pictures[0] ? (
            item?.pictures.map(picture => (
              <Box
                key={picture.url}
                sx={{
                  display: 'flex',
                  height: '100%',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Button
                  sx={{ p: 0 }}
                  onClick={() => {
                    setShowAllPictures(true)
                  }}
                >
                  <CardMedia
                    sx={{
                      maxHeight: 280,
                      maxWidth: 280,
                      borderRadius: '1rem',
                      zIndex: -1,
                    }}
                    component="img"
                    image={picture.url}
                    alt="No image"
                  />
                </Button>
              </Box>
            ))
          ) : (
            <CardMedia
              sx={{
                maxHeight: 280,
                maxWidth: 280,
                borderRadius: '1rem',
                zIndex: -1,
              }}
              component="img"
              image={lenditLogo}
              alt="No image"
            />
          )}
        </SwipeableViews>
      </Box>

      {item?.pictures && (
        <MobileStepper
          sx={{ p: '.5rem' }}
          steps={item.pictures.length === 0 ? 1 : item.pictures.length}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button
              sx={{ pl: '1.5rem' }}
              size="small"
              onClick={handleNext}
              disabled={
                activeStep === item.pictures.length - 1 ||
                item.pictures.length === 0
              }
            >
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button
              sx={{ pr: '1.5rem' }}
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
      )}
    </Box>
  )
}
