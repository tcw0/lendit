import {
  Box,
  Button,
  Container,
  Typography,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  InputAdornment,
  Stack,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import { ItemDto } from '@api/models/ItemDto'
import { UserMetaDataDto } from '@api/models/UserMetaDataDto'
import { DateRangePicker, Divider } from 'rsuite'
import { RangeType } from 'rsuite/DateRangePicker'
import 'rsuite/dist/rsuite.css'
import { ItemRatingDto } from '@api/models/ItemRatingDto'
import { useResponsive } from 'src/context/ResponsiveContext'
import { WeekdayEnum } from '@api/models/WeekdayEnum'
import { displayRating, intToPrice } from 'src/helper/helper'

// context
import { useSnackbar } from 'src/context/SnackbarContext'
import { AuthContext } from 'src/context/AuthContext'
import {
  differenceInCalendarDays,
  startOfDay,
  endOfDay,
  addDays,
} from 'date-fns'

// icons
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { InsuranceTypeEnum } from '@api/models/InsuranceTypeEnum'
import { GppGood, RemoveModerator } from '@mui/icons-material'

import { DateRange } from 'rsuite/esm/DateRangePicker/types'
import GreenButtonBase from 'src/components/buttons/GreenButtonBase'

import { ItemsService } from '@api/services/ItemsService'
import { NewRentalDto } from '@api/models/NewRentalDto'
import { RentalsService } from '@api/services/RentalsService'
import { UsersService } from '@api/services/UsersService'
import { UserRatingDto } from '@api/models/UserRatingDto'

import Footer from 'src/components/Footer'
import ShowImageList from './ShowPictureList'
import RatingPage from './RatingPage'
import SwipeablePictureStepper from './SwipeablePictureStepper'

const ranges = [
  {
    label: 'Today',
    value: [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: 'Next 7 Days',
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 6))],
  },
]

export default function ItemPage() {
  const navigate = useNavigate()
  const { itemID } = useParams()
  const { isSmallScreen } = useResponsive()
  const { showSnackBarWithMessage } = useSnackbar()
  const authContext = React.useContext(AuthContext)

  // fetch data states
  const [item, setItem] = React.useState<ItemDto>()
  const [user, setUser] = React.useState<UserMetaDataDto>()
  const [ratings, setRatings] = React.useState<ItemRatingDto[]>([])

  const [openUserRating, setOpenUserRating] = React.useState<boolean>(false)

  const [userRatings, setUserRatings] = React.useState<UserRatingDto[]>([])

  // datepicker and right side bar
  const [date, setDate] =
    React.useState<[(Date | undefined)?, (Date | undefined)?]>()
  const [dayRange, setDayRange] = React.useState<number>(0)
  const [priceExtraDays, setPriceExtraDays] = React.useState<number>(0)
  const [fullPrice, setFullPrice] = React.useState<number>(0)
  const [insurancePrice, setInsurancePrice] = React.useState<number>(0)
  const [insuranceType, setInsuranceType] = React.useState<InsuranceTypeEnum>(
    InsuranceTypeEnum.NONE,
  )

  // for rating page
  const [showAllRatings, setShowAllRatings] = React.useState(false)

  // for shwo image list
  const [showAllPictures, setShowAllPictures] = React.useState<boolean>(false)

  // get item
  React.useEffect(() => {
    const fetchItem = async () => {
      if (itemID) {
        const item = await ItemsService.getItemById(itemID)
        setItem(item)

        // set insurance to basic if required
        if (item.insuranceReq) {
          setInsuranceType(InsuranceTypeEnum.BASIC)
        }
      }
    }
    fetchItem()
  }, [itemID])

  // get item lender
  React.useEffect(() => {
    const fetchUser = async () => {
      if (item?.id) {
        const user = await ItemsService.getItemLender(item?.id)
        setUser(user)
      }
    }

    fetchUser()
  }, [item])

  // get item ratings
  React.useEffect(() => {
    const fetchRatings = async () => {
      if (item?.id) {
        const ratings = await ItemsService.getAllItemRatings(item.id)
        setRatings(ratings)
      }
    }

    fetchRatings()
  }, [item])

  // get user ratings
  React.useEffect(() => {
    const fetchRatings = async () => {
      if (item?.lenderId) {
        const ratings = await UsersService.getAllUserRatings(item.lenderId)
        setUserRatings(ratings)
      }
    }
    fetchRatings()
  }, [item])

  // clac the amount of additional days
  const calcDayRange = (value: [Date?, Date?]) => {
    if (value && value[0] && value[1]) {
      const startDate = value[0]
      const endDate = value[1]
      // without first day
      const days = differenceInCalendarDays(endDate, startDate)
      return days
    }
    return 0
  }

  // calculate insurance price based on insurance type
  const calculateInsurancePrice = useCallback(
    (toCalcInsuranceType: InsuranceTypeEnum): number => {
      if (
        date === undefined ||
        date[0] === undefined ||
        date[1] === undefined
      ) {
        return 0
      }
      switch (toCalcInsuranceType) {
        case InsuranceTypeEnum.NONE:
          return 0
        case InsuranceTypeEnum.BASIC:
          return Math.floor(
            (item?.priceFirstDay
              ? item.priceFirstDay + priceExtraDays
              : priceExtraDays) * 0.1,
          )
        case InsuranceTypeEnum.PREMIUM:
          return Math.floor(
            (item?.priceFirstDay
              ? item.priceFirstDay + priceExtraDays
              : priceExtraDays) * 0.3,
          )
        default:
          return 0
      }
    },
    [date, item, priceExtraDays],
  )

  useEffect(() => {
    if (item && date) {
      // insurance fee

      const insuranceCalc = calculateInsurancePrice(insuranceType)
      setInsurancePrice(insuranceCalc)

      const combinedPriceCalc = item?.priceFirstDay
        ? item.priceFirstDay + priceExtraDays
        : priceExtraDays

      // end price
      const fullPriceCalc = combinedPriceCalc + insuranceCalc
      setFullPrice(fullPriceCalc)
    }
  }, [
    insuranceType,
    item,
    date,
    dayRange,
    priceExtraDays,
    calculateInsurancePrice,
  ])

  // calculate right side form values based on the daterange and prices
  const handleDatePicker = (value: [Date?, Date?]) => {
    // set date value
    if (item) {
      setDate(value)

      // calc day range
      const dayRangeCalc = calcDayRange(value)
      setDayRange(dayRangeCalc)

      // price extra days
      const PriceExtraDaysCalc = item?.pricePerDay
        ? item.pricePerDay * dayRangeCalc
        : 0
      setPriceExtraDays(PriceExtraDaysCalc)

      // combined price to calc insurance fee on
      const combinedPriceCalc = item?.priceFirstDay
        ? item.priceFirstDay + PriceExtraDaysCalc
        : PriceExtraDaysCalc

      // insurance fee
      const insuranceCalc = calculateInsurancePrice(insuranceType)
      setInsurancePrice(insuranceCalc)

      // end price
      const fullPriceCalc = combinedPriceCalc + insuranceCalc
      setFullPrice(fullPriceCalc)
    }
  }

  // to chatch delete of date
  const handleDatePickerChange = (value: DateRange | null) => {
    if (value === null) {
      setDate([undefined, undefined])
      setPriceExtraDays(0)
      setInsurancePrice(0)
      setFullPrice(0)
      setDayRange(0)
    }
  }

  // handle send offer button
  const handleOffer = async () => {
    // check if user is logged in
    if (authContext.authToken) {
      // check if you try to rent your own item
      if (authContext.userId !== item?.lenderId) {
        // create new rental
        if (itemID && date && date[0] && date[1]) {
          const newRental: NewRentalDto = {
            start: date[0].toISOString(),
            end: date[1].toISOString(),
            insuranceType,
            itemId: itemID,
          }
          const rental = await RentalsService.placeRental(newRental)
          navigate(`/rentals/${rental.id}`)
          showSnackBarWithMessage('Rental offer sent out', 'success')
        } else {
          showSnackBarWithMessage(
            'Please fill out all inputs to rent an item',
            'warning',
          )
        }
      } else {
        showSnackBarWithMessage('You cannot rent your own item.', 'error')
      }
    } else {
      showSnackBarWithMessage(
        'You need to be logged in to rent an item',
        'warning',
      )
      authContext.setOpenLogin(true)
    }
  }

  // datepicker attributes
  const datePickerStyle = { width: '100%' }
  const { beforeToday, combine } = DateRangePicker

  // datepicker restrictions
  const whitelist = item?.availability.whitelist
  const blacklist = item?.availability.blacklist
  const availableWeekdays = item?.availability.availableWeekdays

  // function to disable all blacklist, weekday restictions and allow whitelist
  const disabledDate = (date: Date) => {
    // check if the selected date falls within any timespan in the blacklist
    if (blacklist) {
      if (
        blacklist.some(
          ({ start, end }) =>
            date >= new Date(start) && date <= addDays(new Date(end), 1),
        )
      ) {
        return true // disable dates within the blacklist
      }
    }

    // check if the selected date falls within any timespan in the whitelist
    if (whitelist) {
      if (
        whitelist.some(
          ({ start, end }) =>
            date >= new Date(start) && date <= addDays(new Date(end), 1),
        )
      ) {
        return false // enable dates within the whitelist
      }
    }

    // get the day of the week from the selected date
    const dayOfWeek = date.getDay()

    // convert the day of the week to our corresponding WeekdayEnum value
    const weekday = Object.values(WeekdayEnum)[(dayOfWeek + 6) % 7]

    // check if the weekday is included in the availableWeekdays array
    return availableWeekdays ? !availableWeekdays.includes(weekday) : false
  }

  const showInsuranceDetails = (): JSX.Element => {
    switch (insuranceType) {
      case InsuranceTypeEnum.NONE:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: '#EDEDED',
              borderRadius: '.5rem',
              padding: '1rem',
            }}
          >
            <RemoveModerator sx={{ pr: 1, fontSize: 30 }} />
            <Box sx={{ maxWidth: 350 }}>
              <Typography variant="body1">No insurance</Typography>
              <Typography variant="body2">
                Without insurance, you are fully liable for any damages to the
                rented item. We highly recommend to protect yourself with an
                insurance.
              </Typography>
            </Box>
          </Box>
        )
      case InsuranceTypeEnum.BASIC:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: '#EDEDED',
              borderRadius: '.5rem',
              padding: '1rem',
            }}
          >
            <GppGood sx={{ pr: 1, fontSize: 30 }} color="secondary" />
            <Box sx={{ maxWidth: 350 }}>
              <Typography variant="body1">Basic insurance</Typography>
              <Typography variant="body2">
                lendit&apos;s basic insurance got you covered. In case of any
                non-self inflicted damages, lendit covers up to €50.00 of the
                item value. Choose premium insurance to be fully protected.
              </Typography>
            </Box>
          </Box>
        )
      case InsuranceTypeEnum.PREMIUM:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: '#EDEDED',
              borderRadius: '.5rem',
              padding: '1rem',
            }}
          >
            <AssuredWorkloadIcon
              sx={{ pr: 1, fontSize: 30 }}
              color="secondary"
            />
            <Box sx={{ maxWidth: 350 }}>
              <Typography variant="body1">Premium insurance</Typography>
              <Typography variant="body2">
                lendit premium insurance covers all damages to the rented item
                up to €500.00. No matter, if the damage was self-inflicted or
                not.
              </Typography>
            </Box>
          </Box>
        )
      default:
        return <></>
    }
  }

  return (
    <>
      <Container
        sx={{ display: 'flex', width: '80%', justifyContent: 'center' }}
      >
        <Box
          sx={{
            display: 'flex',
            margin: '1rem',
            marginTop: 'calc(1rem)',
            justifyContent: 'center',
            flexDirection: isSmallScreen ? 'column' : 'row',
          }}
        >
          {/* left content box */}
          <Box
            sx={{
              minWidth: isSmallScreen ? '' : '500px',
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              mb: isSmallScreen ? '1rem' : '0rem',
              mr: isSmallScreen ? '0rem' : '1rem',
              flexWrap: 'nowrap',
              border: 1,
              borderRadius: '1rem',
              borderColor: 'lightgray',
              boxShadow: 2,
            }}
          >
            {/* container for big pic and description */}
            <Box
              sx={{
                mb: '1rem',
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-evenly',
              }}
            >
              {/* big item picture */}
              {item && (
                <SwipeablePictureStepper
                  item={item}
                  setShowAllPictures={setShowAllPictures}
                />
              )}
              {/*  description next to big picture */}
              <Box
                sx={{
                  m: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '150px',
                }}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: 20, my: 1 }}>
                  {item?.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '.5rem',
                  }}
                >
                  <LocationOnIcon
                    sx={{
                      fontSize: 18,
                      color: 'grey',
                      fontWeight: 'light',
                      marginRight: '.4rem',
                      mb: '.25rem',
                    }}
                  />
                  <Typography
                    sx={{ color: 'grey', fontWeight: 'light', fontSize: 18 }}
                  >
                    {item?.address?.zipCode} {item?.address?.city}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mb: '.5rem',
                  }}
                >
                  <LabeledOrPicturedAvatar
                    sx={{
                      height: '3.5rem',
                      width: '3.5rem',
                      my: '1rem',
                      mr: '1rem',
                    }}
                    userName={user ? user?.name : '?'}
                    userProfilePicUrl={user ? user?.picture?.url : undefined}
                    variant="circular"
                  />
                  <Typography>{user?.name}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: '.5rem',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => setOpenUserRating(true)}
                >
                  <StarRateRoundedIcon
                    sx={{ fontSize: 20, marginRight: '.25rem', mb: '.25rem' }}
                  />
                  <Typography sx={{ textDecoration: 'underline' }}>
                    {displayRating(user?.avgRating)}
                  </Typography>
                </Box>
                <Typography sx={{ color: 'grey', fontWeight: 'light' }}>
                  Member since <br />
                  {user?.registeredSince
                    ? new Date(user.registeredSince)
                        .toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                        .replaceAll('/', '.')
                    : ''}
                </Typography>
              </Box>
            </Box>

            {/* bottom description header and text */}
            <Box sx={{ margin: '1rem' }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>
                Description:
              </Typography>
              <Typography
                sx={{ fontSize: '1rem', m: '1rem', textAlign: 'justify' }}
              >
                {item?.description}
              </Typography>
            </Box>

            {/* first rating */}
            {ratings && ratings[0] ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarRateRoundedIcon
                    sx={{
                      fontSize: '1.5rem',
                      marginRight: '.25rem',
                      mb: '.25rem',
                    }}
                  />
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {item?.avgRating.avgRating.toFixed(2)}
                  </Typography>
                  <FiberManualRecordIcon
                    sx={{ fontSize: '.5rem', mx: '.25rem' }}
                  />
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {item?.avgRating.count}{' '}
                    {item?.avgRating.count === 1 ? 'Review' : 'Reviews'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <LabeledOrPicturedAvatar
                    sx={{
                      height: '3.5rem',
                      width: '3.5rem',
                      my: '1rem',
                      mx: '.5rem',
                    }}
                    userName={ratings[0].authorName}
                    userProfilePicUrl={ratings[0].authorPicture?.url}
                    variant="circular"
                  />
                  <Box sx={{ mx: '.5rem' }}>
                    <Typography>{ratings[0].authorName}</Typography>
                    <Typography>
                      {new Date(ratings[0].time)
                        .toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                        .replaceAll('/', '.')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mx: '1rem', mt: '.5rem' }}>
                  <Typography>{ratings[0].text}</Typography>
                </Box>
                <Button
                  sx={{
                    border: 1,
                    borderRadius: '.5rem',
                    my: '1rem',
                    textTransform: 'none',
                  }}
                  onClick={() => {
                    setShowAllRatings(true)
                  }}
                >
                  <Typography sx={{ fontSize: '1rem', px: '1rem' }}>
                    Show all reviews
                  </Typography>
                </Button>
              </Box>
            ) : (
              <>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', mx: '1rem' }}>
                    No Reviews
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    mx: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <SentimentVeryDissatisfiedIcon sx={{ fontSize: '2rem' }} />
                  <Typography sx={{ textAlign: 'justify', m: '1rem' }}>
                    We are sorry, there are no reviews for this item available
                    yet... rent it and be the first one!
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {/* right sidebar */}
          <Box
            sx={{
              padding: '1.5rem',
              border: 1,
              borderRadius: '1rem',
              borderColor: 'lightgray',
              boxShadow: 2,
              minWidth: '350px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  {intToPrice(item?.priceFirstDay)} first day
                </Typography>
                <Typography
                  sx={{
                    color: 'grey',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  {intToPrice(item?.pricePerDay)} per extra day
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarRateRoundedIcon
                  sx={{ fontSize: '1rem', marginRight: '.25rem', mb: '.25rem' }}
                />
                <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {displayRating(item?.avgRating)}
                </Typography>
              </Box>
            </Box>

            <Stack direction="column" spacing={2} sx={{ mt: '1rem' }}>
              <Box>
                <InputLabel>Rental Period</InputLabel>
                <DateRangePicker
                  onChange={handleDatePickerChange}
                  style={datePickerStyle}
                  size="lg"
                  showOneCalendar
                  character=" – "
                  ranges={ranges as RangeType[]}
                  placeholder="Select rental dates"
                  shouldDisableDate={
                    combine
                      ? combine(
                          beforeToday ? beforeToday() : undefined,
                          disabledDate,
                        )
                      : undefined
                  }
                  onOk={handleDatePicker}
                />
              </Box>
              <Box>
                <InputLabel>Insurance</InputLabel>
                <Select
                  sx={{ width: '100%', mb: '1rem' }}
                  value={insuranceType}
                  label="Insurance"
                  size="small"
                  onChange={(e: SelectChangeEvent) =>
                    setInsuranceType(e.target.value as InsuranceTypeEnum)
                  }
                  inputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        Insurance:
                      </InputAdornment>
                    ),
                  }}
                >
                  {!item?.insuranceReq && (
                    <MenuItem value={InsuranceTypeEnum.NONE}>
                      <em>None</em>
                    </MenuItem>
                  )}
                  <MenuItem value={InsuranceTypeEnum.BASIC}>Basic</MenuItem>
                  <MenuItem value={InsuranceTypeEnum.PREMIUM}>Premium</MenuItem>
                </Select>
                {showInsuranceDetails()}
                {item?.insuranceReq && (
                  <Typography pl={2} variant="caption">
                    Insurance is required for this item.
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Price Calculation */}
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', px: 2 }}
              >
                <Typography>First day</Typography>
                <Typography>{intToPrice(item?.priceFirstDay)}</Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', px: 2 }}
              >
                <Typography>
                  {intToPrice(item?.pricePerDay)} x {dayRange} extra days
                </Typography>
                <Typography>{intToPrice(priceExtraDays)}</Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', px: 2 }}
              >
                <Typography>
                  {(() => {
                    switch (insuranceType) {
                      case InsuranceTypeEnum.NONE:
                        return 'No insurance'
                      case InsuranceTypeEnum.BASIC:
                        return 'Basic insurance 10%'
                      case InsuranceTypeEnum.PREMIUM:
                        return 'Premium insurance 30%'
                      default:
                        return 'No insurance'
                    }
                  })()}
                </Typography>
                <Typography>{intToPrice(insurancePrice)}</Typography>
              </Stack>

              <Divider />
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', px: 2 }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {intToPrice(fullPrice)}
                </Typography>
              </Stack>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: '1rem' }}>
              <GreenButtonBase
                sx={{ width: '100%', height: '3rem' }}
                onClick={handleOffer}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Send offer
                </Typography>
              </GreenButtonBase>
            </Box>
          </Box>
        </Box>
        <RatingPage
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          property={user!}
          ratings={userRatings}
          showAllRatings={openUserRating}
          setShowAllRatings={setOpenUserRating}
        />
        {item && ratings && (
          <RatingPage
            property={item}
            ratings={ratings}
            showAllRatings={showAllRatings}
            setShowAllRatings={setShowAllRatings}
          />
        )}
        {item && (
          <ShowImageList
            item={item}
            showAllPictures={showAllPictures}
            setShowAllPictures={setShowAllPictures}
          />
        )}
      </Container>
      <Footer />
    </>
  )
}
