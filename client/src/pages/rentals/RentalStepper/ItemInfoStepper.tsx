import { RentalDto } from '@api/models/RentalDto'
import { AssuredWorkload, GppGood, RemoveModerator } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSnackbar } from 'src/context/SnackbarContext'
import { useNavigate } from 'react-router-dom'
import lenditLogo from 'src/assets/lenditLogo.png'
import { RentalsService } from '@api/services/RentalsService'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { InsuranceTypeEnum } from '@api/models/InsuranceTypeEnum'
import { intToPrice } from '../../../helper/helper'

type ItemInfoStepperProps = {
  rental?: RentalDto
  isLoadingRental: boolean
}

export default function ItemInfoStepper(
  props: ItemInfoStepperProps,
): JSX.Element {
  const { rental, isLoadingRental } = props
  const { showSnackBarWithError } = useSnackbar()
  const navigate = useNavigate()

  const [item, setItem] = useState<ItemMetaDataDto | undefined>(undefined)

  useEffect(() => {
    const fetchItem = async () => {
      if (rental) {
        try {
          const retrievedItem: ItemMetaDataDto =
            await RentalsService.getRentalItem(rental.id)
          setItem(retrievedItem)
        } catch (error) {
          showSnackBarWithError(error)
        }
      }
    }

    fetchItem()
  }, [rental, showSnackBarWithError])

  const getInsuranceInfo = (insuranceType: InsuranceTypeEnum): JSX.Element => {
    switch (insuranceType) {
      case InsuranceTypeEnum.BASIC:
        return (
          <Tooltip title="Basic insurance">
            <GppGood color="secondary" />
          </Tooltip>
        )
      case InsuranceTypeEnum.PREMIUM:
        return (
          <Tooltip title="Premium insurance">
            <AssuredWorkload color="secondary" />
          </Tooltip>
        )
      case InsuranceTypeEnum.NONE:
        return (
          <Tooltip title="No insurance">
            <RemoveModerator />
          </Tooltip>
        )
      default:
        return (
          <Tooltip title="No insurance">
            <RemoveModerator />
          </Tooltip>
        )
    }
  }

  return (
    <>
      {rental && item && !isLoadingRental ? (
        <>
          <Avatar
            onClick={() => navigate(`/items/${item?.id}`)}
            variant="rounded"
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              ml: 1,
              cursor: 'pointer',
            }}
            src={item?.picture ? item?.picture.url : lenditLogo}
          />

          <Stack direction="column" spacing={-1} flexGrow={1}>
            <Typography fontWeight={700} variant="subtitle1">
              {item.title}
            </Typography>
            <Typography color="gray" variant="caption">
              {new Date(rental.start).toLocaleDateString(undefined, {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
              })}{' '}
              -{' '}
              {new Date(rental.end).toLocaleDateString(undefined, {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
              })}
            </Typography>
            <Typography fontWeight={600} variant="subtitle1">
              {rental && intToPrice(rental.price + rental.insurancePrice)}
            </Typography>
          </Stack>
          <Box pr={1}>{getInsuranceInfo(rental.insuranceType)}</Box>
        </>
      ) : (
        isLoadingRental && (
          <>
            <Skeleton
              sx={{ ml: 1, width: 60, height: 60, borderRadius: 2 }}
              variant="circular"
            />
            <Stack direction="column" flexGrow={1}>
              <Skeleton sx={{ width: '90%' }} variant="text" />
              <Skeleton sx={{ width: '90%' }} variant="text" />
              <Skeleton sx={{ width: '90%' }} variant="text" />
            </Stack>

            <Box pr={1}>
              <Skeleton
                sx={{ width: 30, height: 30, borderRadius: 5 }}
                variant="circular"
              />
            </Box>
          </>
        )
      )}
    </>
  )
}

ItemInfoStepper.defaultProps = {
  rental: undefined,
}
