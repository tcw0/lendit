import React from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { AvailabilityDto } from '@api/models/AvailabilityDto'
import { NewItemDto } from '@api/models/NewItemDto'
import { ItemDto } from '@api/models/ItemDto'
import { WeekdayEnum } from '@api/models/WeekdayEnum'
import { CategoryEnum } from '@api/models/CategoryEnum'
import { ItemsService } from '@api/services/ItemsService'
import { AuthContext } from 'src/context/AuthContext'
import { SnackbarContext } from 'src/context/SnackbarContext'
import { UsersService } from '@api/services/UsersService'
import { PictureDto } from '@api/models/PictureDto'
import { AddressDto } from '@api/models/AddressDto'
import { intToDecimal } from 'src/helper/helper'
import { Suggestion } from 'src/assets/upload_suggestions'

import { Divider } from '@mui/material'
import DetailsForm from './DetailsForm'
import AddressForm from './AddressForm'
import AvailabilityForm from './AvailabilityForm'
import FeaturedBooking from './FeaturedBooking'

export default function AddItem({
  itemId,
  handleClose,
  suggestion,
}: {
  itemId?: string
  handleClose?: () => void
  suggestion?: Suggestion
}) {
  const [images, setImages] = React.useState<(File | PictureDto)[]>([])
  const [title, setTitle] = React.useState('')
  const [selectedCategories, setSelectedCategories] = React.useState<
    CategoryEnum[]
  >([])
  const [description, setDescription] = React.useState('')
  const [priceFirstDay, setPriceFirstDay] = React.useState('')
  const [pricePerDay, setPricePerDay] = React.useState('')
  const [mandatoryInsurance, setMandatoryInsurance] = React.useState(false)
  const [selectedAddress, setSelectedAddress] = React.useState<
    AddressDto | undefined
  >(undefined)
  const [selectedWeekdays, setSelectedWeekdays] = React.useState<WeekdayEnum[]>(
    [],
  )
  const [whitelist, setWhitelist] = React.useState<[[Date, Date] | null]>([
    null,
  ])
  const [blacklist, setBlacklist] = React.useState<[[Date, Date] | null]>([
    null,
  ])

  const { userId } = React.useContext(AuthContext)
  const { showSnackBarWithError, showSnackBarWithMessage } =
    React.useContext(SnackbarContext)

  const [itemToUpdate, setItemToUpdate] = React.useState<ItemDto | undefined>(
    undefined,
  )

  const fetchItem = React.useCallback(async () => {
    if (itemId) {
      const retrievedItem = await ItemsService.getItemById(itemId)
      setItemToUpdate(retrievedItem)

      setImages(retrievedItem.pictures)
      setTitle(retrievedItem.title)
      setSelectedCategories(retrievedItem.categories)
      setDescription(retrievedItem.description)
      setPriceFirstDay(intToDecimal(retrievedItem.priceFirstDay))
      setPricePerDay(intToDecimal(retrievedItem.pricePerDay))
      setMandatoryInsurance(retrievedItem.insuranceReq)
      setSelectedAddress(retrievedItem.address)
      setSelectedWeekdays(retrievedItem.availability?.availableWeekdays ?? [])

      const tempWhiteList = retrievedItem.availability?.whitelist.map(
        availability => {
          if (availability) {
            return [
              new Date(availability.start),
              new Date(availability.end),
            ] as [Date, Date]
          }
          return null
        },
      )
      setWhitelist(tempWhiteList as [[Date, Date] | null])

      const tempBlackList = retrievedItem.availability?.blacklist.map(
        unavailability => {
          if (unavailability) {
            return [
              new Date(unavailability.start),
              new Date(unavailability.end),
            ] as [Date, Date]
          }
          return null
        },
      )
      setBlacklist(tempBlackList as [[Date, Date] | null])
    } else {
      showSnackBarWithMessage('Please log in to see the item', 'error')
    }
  }, [itemId, showSnackBarWithMessage])

  React.useEffect(() => {
    if (suggestion) {
      setTitle(suggestion.name)
      setSelectedCategories(suggestion.categories)
      setDescription(suggestion.description)
    } else if (itemId) {
      fetchItem()
    }
  }, [itemId, fetchItem, suggestion, setTitle])

  const steps = ['Details', 'Address', 'Availability']

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <DetailsForm
            images={images}
            setImages={setImages}
            title={title}
            setTitle={setTitle}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            description={description}
            setDescription={setDescription}
            priceFirstDay={priceFirstDay}
            setPriceFirstDay={setPriceFirstDay}
            pricePerDay={pricePerDay}
            setPricePerDay={setPricePerDay}
            mandatoryInsurance={mandatoryInsurance}
            setMandatoryInsurance={setMandatoryInsurance}
          />
        )
      case 1:
        return (
          <AddressForm
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        )
      case 2:
        return (
          <AvailabilityForm
            selectedWeekdays={selectedWeekdays}
            setSelectedWeekdays={setSelectedWeekdays}
            whitelist={whitelist}
            setWhitelist={setWhitelist}
            blacklist={blacklist}
            setBlacklist={setBlacklist}
          />
        )
      default:
        throw new Error('Unknown step')
    }
  }

  const [activeStep, setActiveStep] = React.useState(0)
  const [publishedItemId, setPublishedItemId] = React.useState<string>('')

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  async function getImageUrls(
    localOrUploadedImages: (File | PictureDto)[],
    isAddItem: boolean,
  ) {
    let imageUrls: PictureDto[] = []
    if (localOrUploadedImages.length > 0) {
      if (isAddItem) {
        imageUrls = await UsersService.uploadPicture({
          files: localOrUploadedImages as File[],
        })
      } else {
        imageUrls = (
          await Promise.all(
            localOrUploadedImages.map(async image => {
              if (image instanceof File) {
                const imageUrl = await UsersService.uploadPicture({
                  files: [image],
                })
                if (imageUrl.length > 0) {
                  return imageUrl[0]
                }

                showSnackBarWithMessage(
                  'Something went wrong while uploading your images',
                  'error',
                )

                return undefined
              }

              return image
            }),
          )
        ).filter(image => image !== undefined) as PictureDto[]
      }
    }
    return imageUrls as PictureDto[]
  }

  const createNewItem = async () => {
    let firstPrice: number
    if (!priceFirstDay.includes('.')) {
      firstPrice = parseInt(`${priceFirstDay}00`, 10)
    } else if (priceFirstDay.endsWith('.')) {
      firstPrice = parseInt(`${priceFirstDay.replace(/[,.]/g, '')}00`, 10)
    } else {
      // Pad two decimal places & remove punctuation
      firstPrice = parseInt(
        priceFirstDay.replace(/^(\d*\.\d)$/, '$10').replace(/[,.]/g, ''),
        10,
      )
    }

    let nextPrice: number
    if (!pricePerDay.includes('.')) {
      nextPrice = parseInt(`${pricePerDay}00`, 10)
    } else if (pricePerDay.endsWith('.')) {
      nextPrice = parseInt(`${pricePerDay.replace(/[,.]/g, '')}00`, 10)
    } else {
      // Pad two decimal places & remove punctuation
      nextPrice = parseInt(
        pricePerDay.replace(/^(\d*\.\d)$/, '$10').replace(/[,.]/g, ''),
        10,
      )
    }

    if (!Number.isNaN(firstPrice) && !Number.isNaN(nextPrice)) {
      if (userId) {
        try {
          const imageUrls = await getImageUrls(images, !itemId)

          const newItem: NewItemDto = {
            title,
            description,
            priceFirstDay: firstPrice,
            pricePerDay: nextPrice,
            availability: {
              whitelist: whitelist
                .map(availability => {
                  if (availability) {
                    return {
                      start: availability[0].toDateString(),
                      end: availability[1].toDateString(),
                    }
                  }
                  return undefined
                })
                .filter(availability => availability !== undefined),
              blacklist: blacklist
                .map(unavailability => {
                  if (unavailability) {
                    return {
                      start: unavailability[0].toISOString(),
                      end: unavailability[1].toISOString(),
                    }
                  }
                  return undefined
                })
                .filter(unavailability => unavailability !== undefined),
              availableWeekdays: selectedWeekdays,
            } as AvailabilityDto,
            pictures: imageUrls,
            insuranceReq: mandatoryInsurance,
            categories: selectedCategories,
            addressId: selectedAddress?.id,
          }

          return newItem
        } catch (error) {
          showSnackBarWithError(error)
        }
      } else {
        showSnackBarWithMessage(
          !itemId
            ? 'Please log in to add an item'
            : 'Please log in to update an item',
          'error',
        )
      }
    } else {
      showSnackBarWithMessage('Please enter valid prices', 'error')
    }

    return undefined
  }

  const handleSubmit = async () => {
    try {
      const newItem = await createNewItem()
      if (newItem) {
        const publishedItem = await ItemsService.addItem(newItem)
        showSnackBarWithMessage(
          'Your item was successfully published!',
          'success',
        )
        setPublishedItemId(publishedItem.id)
        handleNext()
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  const handleUpdate = async () => {
    try {
      const newItem = await createNewItem()
      if (newItem && itemId && itemToUpdate) {
        const updatedItem: ItemDto = {
          id: itemId,
          title: newItem.title,
          description: newItem.description,
          priceFirstDay: newItem.priceFirstDay,
          pricePerDay: newItem.pricePerDay,
          availability: newItem.availability,
          pictures: newItem.pictures,
          avgRating: itemToUpdate.avgRating,
          insuranceReq: newItem.insuranceReq,
          categories: newItem.categories,
          lenderId: itemToUpdate.lenderId,
          address: selectedAddress,
        }
        await ItemsService.updateItemById(itemId, updatedItem)
        showSnackBarWithMessage(
          'Your item was successfully updated!',
          'success',
        )

        if (handleClose) {
          handleClose()
        }
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{ mt: itemId || suggestion ? 0 : 16, mb: 4 }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        {!itemId && !suggestion && (
          <Typography
            component="h1"
            variant="h4"
            align="center"
            fontWeight="bold"
          >
            Add item
          </Typography>
        )}
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map(label => (
            <Step
              key={label}
              sx={{
                '& .Mui-active': {
                  fontWeight: 'bold',
                },
                '& .Mui-completed': {
                  fontWeight: 'bold',
                },
                '& .MuiStepLabel-iconContainer .Mui-active': {
                  color: 'secondary.main', // circle color (ACTIVE)
                },
                '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                  fill: 'primary.main', // circle's number (ACTIVE)
                },
              }}
            >
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && !itemId ? (
          <>
            <Typography variant="h5" gutterBottom>
              Thank you for publishing an item.
            </Typography>
            <Typography variant="subtitle1">
              You can find an overview of your item{' '}
              <Link color="inherit" href={`/items/${publishedItemId}`}>
                here
              </Link>
              . Feel free to edit the item details, update availability, or make
              any changes as needed. If you have any questions or need
              assistance, please contact our support team.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <FeaturedBooking itemId={publishedItemId} />
          </>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                  Back
                </Button>
              )}

              {activeStep !== steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                  disabled={
                    activeStep === 0 &&
                    (!title ||
                      !selectedCategories.length ||
                      !description ||
                      !priceFirstDay ||
                      !pricePerDay)
                  }
                >
                  Next
                </Button>
              )}

              {activeStep === steps.length - 1 &&
                (itemId ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUpdate}
                    sx={{ mt: 3, ml: 1, fontWeight: 'bold' }}
                    disabled={!selectedWeekdays.length}
                  >
                    Update Offer
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmit}
                    sx={{ mt: 3, ml: 1, fontWeight: 'bold' }}
                    disabled={!selectedWeekdays.length}
                  >
                    Publish Offer
                  </Button>
                ))}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

AddItem.defaultProps = {
  itemId: undefined,
  handleClose: undefined,
  suggestion: undefined,
}
