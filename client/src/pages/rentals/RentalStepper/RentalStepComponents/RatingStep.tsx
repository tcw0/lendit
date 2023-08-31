import { ItemRatingDto } from '@api/models/ItemRatingDto'
import { NewRatingDto } from '@api/models/NewRatingDto'
import { RentalDto } from '@api/models/RentalDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { RentalStateEnum } from '@api/models/RentalStateEnum'
import { UserRatingDto } from '@api/models/UserRatingDto'
import { RentalsService } from '@api/services/RentalsService'
import { CheckCircle } from '@mui/icons-material'
import {
  Button,
  Rating,
  Stack,
  StepContent,
  StepLabel,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { useSnackbar } from 'src/context/SnackbarContext'

type RatingStepProps = {
  rental?: RentalDto
  reloadRental: () => void
  role: RentalRoleEnum
}

export default function RatingStep(props: RatingStepProps): JSX.Element {
  const { rental, reloadRental, role } = props
  const { showSnackBarWithError } = useSnackbar()

  const [itemRatingStars, setItemRatingStars] = React.useState<number>(5)
  const [renterRatingStars, setRenterRatingStars] = React.useState<number>(5)
  const [lenderRatingStars, setLenderRatingStars] = React.useState<number>(5)

  const [itemRatingText, setItemRatingText] = React.useState<string>('')
  const [renterRatingText, setRenterRatingText] = React.useState<string>('')
  const [lenderRatingText, setLenderRatingText] = React.useState<string>('')

  const [itemRating, setItemRating] = React.useState<ItemRatingDto | undefined>(
    undefined,
  )
  const [lenderRating, setLenderRating] = React.useState<
    UserRatingDto | undefined
  >(undefined)
  const [renterRating, setRenterRating] = React.useState<
    UserRatingDto | undefined
  >(undefined)

  const finishButtonDisabled = (): boolean => {
    return Boolean(
      rental?.rentalState !== RentalStateEnum.RETURN_CONFIRMED ||
        (role === RentalRoleEnum.RENTER && itemRating && lenderRating) ||
        (role === RentalRoleEnum.LENDER && renterRating),
    )
  }

  useEffect(() => {
    const fetchRatings = async () => {
      if (rental) {
        if (role === RentalRoleEnum.RENTER) {
          try {
            const currentItemRating = await RentalsService.getRentalItemRating(
              rental.id,
            )
            setItemRating(currentItemRating)
            setItemRatingStars(currentItemRating?.stars || 5)
            setItemRatingText(currentItemRating?.text || '')
          } catch (error) {
            showSnackBarWithError(error)
          }

          try {
            const currentLenderRating =
              await RentalsService.getRentalLenderRating(rental.id)
            setLenderRating(currentLenderRating)
            setLenderRatingStars(currentLenderRating?.stars || 5)
            setLenderRatingText(currentLenderRating?.text || '')
          } catch (error) {
            showSnackBarWithError(error)
          }
        } else if (role === RentalRoleEnum.LENDER) {
          try {
            const currentRenterRating =
              await RentalsService.getRentalRenterRating(rental.id)
            setRenterRating(currentRenterRating)
            setRenterRatingStars(currentRenterRating?.stars || 5)
            setRenterRatingText(currentRenterRating?.text || '')
          } catch (error) {
            showSnackBarWithError(error)
          }
        }
      }
    }
    fetchRatings()
  }, [rental, role, showSnackBarWithError])

  const handleRatingFinish = async () => {
    if (rental) {
      if (role === RentalRoleEnum.RENTER) {
        try {
          const newItemRating = await RentalsService.createRentalItemRating(
            rental.id,
            {
              stars: itemRatingStars,
              text: itemRatingText,
            } as NewRatingDto,
          )
          setItemRating(newItemRating)
        } catch (error) {
          showSnackBarWithError(error)
        }
        try {
          const newLenderRating = await RentalsService.createRentalLenderRating(
            rental.id,
            {
              stars: lenderRatingStars,
              text: lenderRatingText,
            } as NewRatingDto,
          )
          setLenderRating(newLenderRating)
        } catch (error) {
          showSnackBarWithError(error)
        }
      } else if (role === RentalRoleEnum.LENDER) {
        try {
          const newRenterRating = await RentalsService.createRentalRenterRating(
            rental.id,
            {
              stars: renterRatingStars,
              text: renterRatingText,
            } as NewRatingDto,
          )
          setRenterRating(newRenterRating)
        } catch (error) {
          showSnackBarWithError(error)
        }
      }
      reloadRental()
    }
  }

  return (
    <>
      <StepLabel>
        <Typography fontWeight={600} variant="subtitle1">
          Rating
        </Typography>
      </StepLabel>
      <StepContent>
        <Stack direction="column" spacing={1}>
          {role === RentalRoleEnum.RENTER ? (
            <>
              <Stack direction="column" spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1">Item</Typography>
                  <Rating
                    size="large"
                    value={itemRatingStars}
                    disabled={Boolean(itemRating)}
                    onChange={(
                      _: React.SyntheticEvent<Element, Event>,
                      newValue: number | null,
                    ) => setItemRatingStars(newValue || 5)}
                  />
                </Stack>
                <TextField
                  label="How was your experience with the item?"
                  multiline
                  disabled={Boolean(itemRating)}
                  size="small"
                  rows={2}
                  value={itemRatingText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setItemRatingText(e.target.value)
                  }
                />
              </Stack>
              <Stack direction="column" spacing={1.5} pt={2}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1">Lender</Typography>
                  <Rating
                    size="large"
                    value={lenderRatingStars}
                    disabled={Boolean(lenderRating)}
                    onChange={(
                      _: React.SyntheticEvent<Element, Event>,
                      newValue: number | null,
                    ) => setLenderRatingStars(newValue || 5)}
                  />
                </Stack>
                <TextField
                  label="How was your experience with the lender?"
                  multiline
                  size="small"
                  rows={2}
                  value={lenderRatingText}
                  disabled={Boolean(lenderRating)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLenderRatingText(e.target.value)
                  }
                />
              </Stack>
            </>
          ) : (
            <Stack direction="column" spacing={1.5}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1">Renter</Typography>
                <Rating
                  size="large"
                  value={renterRatingStars}
                  disabled={Boolean(renterRating)}
                  onChange={(
                    _: React.SyntheticEvent<Element, Event>,
                    newValue: number | null,
                  ) => setRenterRatingStars(newValue || 5)}
                />
              </Stack>
              <TextField
                label="How was your experience with the renter?"
                multiline
                size="small"
                rows={2}
                value={renterRatingText}
                disabled={Boolean(renterRating)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRenterRatingText(e.target.value)
                }
              />
            </Stack>
          )}
        </Stack>
        {finishButtonDisabled() ? (
          <Stack direction="row" spacing={1} pt={1}>
            <CheckCircle />
            <Typography variant="body2">
              Rating
              {role === RentalRoleEnum.RENTER ? 's' : ''} submitted.
            </Typography>
          </Stack>
        ) : (
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            disabled={finishButtonDisabled()}
            onClick={handleRatingFinish}
          >
            Submit Rating{role === RentalRoleEnum.RENTER ? 's' : ''}
          </Button>
        )}
      </StepContent>
    </>
  )
}

RatingStep.defaultProps = {
  rental: undefined,
}
