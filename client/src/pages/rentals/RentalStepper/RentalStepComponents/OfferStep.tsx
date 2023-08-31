import { RentalDto } from '@api/models/RentalDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { RentalStateEnum } from '@api/models/RentalStateEnum'
import { RentalsService } from '@api/services/RentalsService'
import { Cancel, CheckCircle } from '@mui/icons-material'
import {
  Button,
  Stack,
  StepContent,
  StepLabel,
  Typography,
} from '@mui/material'
import React from 'react'

type OfferStepProps = {
  rental?: RentalDto
  setRental: (rental: RentalDto) => void
  role: RentalRoleEnum
}

export default function OfferStep(props: OfferStepProps): JSX.Element {
  const { rental, setRental, role } = props

  const onReject = async () => {
    if (rental) {
      const newRental = await RentalsService.declineRental(rental?.id)
      setRental(newRental)
    }
  }

  const onAccept = async () => {
    if (rental) {
      const newRental = await RentalsService.acceptRental(rental?.id)
      setRental(newRental)
    }
  }

  return (
    <>
      <StepLabel>
        <Typography fontWeight={600} variant="subtitle1">
          Rental Offer
        </Typography>
      </StepLabel>
      <StepContent>
        {rental?.rentalState === RentalStateEnum.OFFER && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={onAccept}
              disabled={
                rental?.rentalState !== RentalStateEnum.OFFER ||
                role !== RentalRoleEnum.LENDER
              }
            >
              <Typography>Accept</Typography>
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={onReject}
              disabled={
                rental?.rentalState !== RentalStateEnum.OFFER ||
                role !== RentalRoleEnum.LENDER
              }
            >
              <Typography>Reject</Typography>
            </Button>
          </Stack>
        )}
        {rental?.rentalState !== RentalStateEnum.OFFER && (
          <Stack direction="row" spacing={1} pt={1}>
            {rental?.rentalState === RentalStateEnum.DECLINED ? (
              <>
                <Cancel />
                <Typography variant="body2">The offer was declined.</Typography>
              </>
            ) : (
              <>
                <CheckCircle />
                <Typography variant="body2">The offer was accepted.</Typography>
              </>
            )}
          </Stack>
        )}
      </StepContent>
    </>
  )
}

OfferStep.defaultProps = {
  rental: undefined,
}
