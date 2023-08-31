import { RentalDto } from '@api/models/RentalDto'
import { RentalStateEnum } from '@api/models/RentalStateEnum'
import { Box, Divider, Stack, Step, Stepper } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useCallback, useEffect, useState } from 'react'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { HandoverTypeEnum } from '@api/models/HandoverTypeEnum'
import { useResponsive } from 'src/context/ResponsiveContext'
import ItemInfoStepper from './ItemInfoStepper'
import OfferStep from './RentalStepComponents/OfferStep'
import PaymentStep from './RentalStepComponents/PaymentStep'
import HandoverStep from './RentalStepComponents/HandoverStep'
import RatingStep from './RentalStepComponents/RatingStep'

type RentalStepperProps = {
  rental?: RentalDto
  isLoadingRental: boolean
  reloadRental: () => void
  setCurrentRental: (rental: RentalDto) => void
  role: RentalRoleEnum
}

const RentalStep = styled(Step)(({ theme }) => ({
  '& .Mui-active': {
    fontWeight: 'bold',
  },
  '& .Mui-completed': {
    fontWeight: 'bold',
  },
  '& .MuiStepLabel-iconContainer .Mui-active': {
    color: theme.palette.secondary.main, // circle color (ACTIVE)
  },
  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
    fill: theme.palette.primary.contrastText,
  },
}))

export default function RentalStepper(props: RentalStepperProps): JSX.Element {
  const { rental, isLoadingRental, reloadRental, setCurrentRental, role } =
    props

  const { isSmallScreen } = useResponsive()

  const [activeStep, setActiveStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<{
    [k: number]: boolean
  }>([])

  const getActiveStepFromRentalStatus = useCallback(
    (rentalState: RentalStateEnum) => {
      switch (rentalState) {
        case RentalStateEnum.OFFER:
        case RentalStateEnum.DECLINED:
          return 0
        case RentalStateEnum.ACCEPTED:
          return 1
        case RentalStateEnum.PAID:
        case RentalStateEnum.PICKED_UP:
          return 2
        case RentalStateEnum.PICK_UP_CONFIRMED:
        case RentalStateEnum.RETURNED:
          return 3
        case RentalStateEnum.RETURN_CONFIRMED:
          return 4
        default:
          return 5
      }
    },
    [],
  )

  useEffect(() => {
    if (rental) {
      setActiveStep(getActiveStepFromRentalStatus(rental.rentalState))
    }
  }, [rental, getActiveStepFromRentalStatus])

  const updateCompletedSteps = useCallback(
    (rentalState: RentalStateEnum) => {
      setCompletedSteps(prevCompletedSteps => {
        const toReturn = prevCompletedSteps
        const activeUntil = getActiveStepFromRentalStatus(rentalState)
        const allSteps = [...Array(6).keys()]
        allSteps.forEach(step => {
          toReturn[step] = step < activeUntil
        })
        return toReturn
      })
    },
    [getActiveStepFromRentalStatus],
  )

  const handleStep = useCallback(
    (rentalState: RentalStateEnum) => {
      if (completedSteps[getActiveStepFromRentalStatus(rentalState)]) {
        const step = getActiveStepFromRentalStatus(rentalState)
        setActiveStep(step)
      } else if (
        rental?.rentalState &&
        getActiveStepFromRentalStatus(rentalState) ===
          getActiveStepFromRentalStatus(rental?.rentalState)
      ) {
        setActiveStep(getActiveStepFromRentalStatus(rentalState))
      }
    },
    [completedSteps, getActiveStepFromRentalStatus, rental],
  )

  useEffect(() => {
    if (rental) {
      handleStep(rental.rentalState)
      updateCompletedSteps(rental.rentalState)
    }
  }, [rental, handleStep, updateCompletedSteps, completedSteps])

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '80px',
          position: 'sticky',
          background: 'white',
          top: isSmallScreen ? 150 : 0,
          zIndex: 1,
          borderBottom: '1px solid lightgrey',
        }}
        spacing={1}
      >
        <ItemInfoStepper rental={rental} isLoadingRental={isLoadingRental} />
      </Stack>
      <Divider />
      <Box
        sx={{
          height: isSmallScreen ? 'calc(100vh - 240px)' : 'calc(100vh - 180px)',
          overflow: 'auto',
        }}
      >
        {rental && (
          <Stepper
            sx={{ p: 1, overflowY: 'auto' }}
            orientation="vertical"
            activeStep={activeStep}
          >
            <RentalStep
              onClick={() => handleStep(RentalStateEnum.OFFER)}
              completed={completedSteps[0]}
            >
              <OfferStep
                rental={rental}
                setRental={setCurrentRental}
                role={role}
              />
            </RentalStep>
            <RentalStep
              onClick={() => handleStep(RentalStateEnum.ACCEPTED)}
              completed={completedSteps[1]}
            >
              <PaymentStep
                rental={rental}
                setRental={setCurrentRental}
                role={role}
              />
            </RentalStep>
            <RentalStep
              onClick={() => handleStep(RentalStateEnum.PAID)}
              completed={completedSteps[2]}
            >
              <HandoverStep
                rental={rental}
                reloadRental={reloadRental}
                role={role}
                handoverType={HandoverTypeEnum.PICKUP}
              />
            </RentalStep>
            <RentalStep
              onClick={() => handleStep(RentalStateEnum.PICK_UP_CONFIRMED)}
              completed={completedSteps[3]}
            >
              <HandoverStep
                rental={rental}
                reloadRental={reloadRental}
                role={role}
                handoverType={HandoverTypeEnum.RETURN}
              />
            </RentalStep>
            <RentalStep
              onClick={() => handleStep(RentalStateEnum.RETURN_CONFIRMED)}
              completed={completedSteps[4]}
            >
              <RatingStep
                rental={rental}
                reloadRental={reloadRental}
                role={role}
              />
            </RentalStep>
          </Stepper>
        )}
      </Box>
    </Box>
  )
}

RentalStepper.defaultProps = {
  rental: undefined,
}
