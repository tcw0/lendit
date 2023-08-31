import React, { useState } from 'react'
import {
  Box,
  IconButton,
  List,
  ListItemText,
  Typography,
  TextField,
  Slider,
  ListItemButton,
  Button,
  Menu,
  MenuItem,
  Rating,
  Tooltip,
} from '@mui/material'
import { DateRangePicker } from 'rsuite'
import 'rsuite/dist/rsuite.css'
import { intToPrice } from 'src/helper/helper'
import './styles.css'
import '@reach/combobox/styles.css'
import GreenButtonBase from 'src/components/buttons/GreenButtonBase'

// icons
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import InfoIcon from '@mui/icons-material/Info'

import { styled, useTheme } from '@mui/material/styles'
// import { AddressDto } from '@api/models/AddressDto'
import { CategoryEnum } from '@api/models/CategoryEnum'
import { useResponsive } from 'src/context/ResponsiveContext'

import { DateRange, RangeType } from 'rsuite/esm/DateRangePicker'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import {
  InputValues,
  SetterFunctions,
  CategoryOpenState,
  FilterOpenState,
} from './Types'
import PlacesAutocomplete from './PlacesAutocomplete'

const CategoryButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '0',
  color: theme.palette.secondary.main,
  backgroundColor: 'transparent',
  '&:hover': {
    color: theme.palette.secondary.main,
    backgroundColor: 'transparent',
  },
}))

const FilterTextField = styled(TextField)(() => ({
  margin: '8px',
  width: 89,
  '& .MuiInputBase-root': {
    height: 45,
  },
  variant: 'outlined',
  '& fieldset': {
    borderRadius: '12px',
  },
  '& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
    {
      display: 'none',
    },
}))

// slider km marks
const marks = [
  {
    value: 0,
    label: '0km',
  },
  {
    value: 100,
    label: '100km',
  },
]

type FilterSidebarProps = {
  setterFunctions: SetterFunctions
  inputValues: InputValues
  categoryOpenState: CategoryOpenState
  filterOpenState: FilterOpenState
}

export default function FilterSidebar({
  setterFunctions,
  inputValues,
  categoryOpenState,
  filterOpenState,
}: FilterSidebarProps) {
  const { isSmallScreen } = useResponsive()
  const theme = useTheme()

  // filter states
  const [categoryValue, setCategoryValue] = useState(
    inputValues.category ? inputValues.category : undefined,
  )
  const [priceFromValue, setPriceFromValue] = useState(
    inputValues.priceFrom ? intToPrice(inputValues.priceFrom) : '',
  )
  const [priceToValue, setPriceToValue] = useState(
    inputValues.priceTo ? intToPrice(inputValues.priceTo) : '',
  )
  const [sortPriceValue, setSortPriceValue] = React.useState<string>(
    inputValues.sortPrice,
  )
  const [selectedStarsValue, setSelectedStarsValue] = React.useState<
    number | null
  >(inputValues.selectedStars ? inputValues.selectedStars : null)

  const [dateValue, setDateValue] = React.useState<DateRange | null>(
    inputValues.dateFrom && inputValues.dateTo
      ? [new Date(inputValues.dateFrom), new Date(inputValues.dateTo)]
      : null,
  )

  const [locationValue, setLocationValue] = React.useState<string | undefined>(
    inputValues.location ? inputValues.location : undefined,
  )
  const [coordinatesValues, setCoordinatesValues] = React.useState<
    { lat: number; lng: number } | undefined
  >(
    inputValues.latitude && inputValues.longitude
      ? { lat: inputValues.latitude, lng: inputValues.longitude }
      : undefined,
  )

  // current distance input
  const [distanceValue, setDistanceValue] = useState(
    inputValues.distance ? inputValues.distance : 0,
  )

  // date picker
  const { beforeToday } = DateRangePicker
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

  const handleOpen = () => {
    categoryOpenState.setCategoryOpen(!categoryOpenState.categoryOpen)
  }

  // set category value to item for highlighting
  const handleCategory = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: CategoryEnum,
  ) => {
    if (categoryValue === item) {
      setCategoryValue(undefined)

      // to fix coloring unselect bug in mobile mode
      if (isSmallScreen) {
        const targetElem = event.target
        const buttonElement = targetElem as HTMLButtonElement
        buttonElement.style.color = '#152944'
      }
    } else {
      setCategoryValue(item)

      // to fix coloring unselect bug in mobile mode
      if (isSmallScreen) {
        const targetElem = event.target
        const buttonElement = targetElem as HTMLButtonElement
        buttonElement.style.color = '#1EE6B6'
      }
    }
    // if not responsive set setterfunction to instantly apply filter
    if (!isSmallScreen) {
      if (inputValues.category === item) {
        setterFunctions.setCategory(undefined)
      } else {
        setterFunctions.setCategory(item)
      }
    }
  }

  // set itemlist price input
  const managePriceClick = () => {
    let priceFromFinal: number
    let rawPriceFromString: string

    // remove special charakters from string before parsing it as int
    if (priceFromValue.includes('€')) {
      rawPriceFromString = priceFromValue.replaceAll('€', '')
    } else {
      // not the case everytime
      rawPriceFromString = priceFromValue
    }

    if (!rawPriceFromString.includes('.')) {
      priceFromFinal = parseInt(`${rawPriceFromString}00`, 10)
    } else if (rawPriceFromString.endsWith('.')) {
      priceFromFinal = parseInt(
        `${rawPriceFromString.replace(/[,.]/g, '')}00`,
        10,
      )
    } else {
      // Pad two decimal places & remove punctuation
      priceFromFinal = parseInt(
        rawPriceFromString.replace(/^(\d*\.\d)$/, '$10').replace(/[,.]/g, ''),
        10,
      )
    }

    let priceToFinal: number
    let rawPriceToString: string

    // remove special charakters from string before parsing it as int
    if (priceToValue.includes('€')) {
      rawPriceToString = priceToValue.replaceAll('€', '')
    } else {
      // not the case everytime
      rawPriceToString = priceToValue
    }

    if (!rawPriceToString.includes('.')) {
      priceToFinal = parseInt(`${rawPriceToString}00`, 10)
    } else if (rawPriceToString.endsWith('.')) {
      priceToFinal = parseInt(`${rawPriceToString.replace(/[,.]/g, '')}00`, 10)
    } else {
      // Pad two decimal places & remove punctuation
      priceToFinal = parseInt(
        rawPriceToString.replace(/^(\d*\.\d)$/, '$10').replace(/[,.]/g, ''),
        10,
      )
    }

    if (Number.isNaN(priceFromFinal)) {
      setterFunctions.setPriceFrom(undefined)
    } else {
      setterFunctions.setPriceFrom(priceFromFinal)
      setPriceFromValue(intToPrice(priceFromFinal))
    }

    if (Number.isNaN(priceToFinal)) {
      setterFunctions.setPriceTo(undefined)
    } else {
      setterFunctions.setPriceTo(priceToFinal)
      setPriceToValue(intToPrice(priceToFinal))
    }
  }

  const handleStarChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number | null,
  ) => {
    setSelectedStarsValue(newValue)

    if (!isSmallScreen) {
      setterFunctions.setSelectedStars(newValue)
    }
  }

  // set itemlist date input
  const handleDatePicker = (value: DateRange | null) => {
    if (value !== null) {
      setDateValue(value)

      if (!isSmallScreen) {
        setterFunctions.setDateFrom(value[0]?.toDateString())
        setterFunctions.setDateTo(value[1]?.toDateString())
      }
    }
  }

  const handleCleanPicker = () => {
    setDateValue(null)

    if (!isSmallScreen) {
      setterFunctions.setDateFrom(undefined)
      setterFunctions.setDateTo(undefined)
    }
  }

  // triggered by slider commit
  const handleLocation = () => {
    // set directly of not responsive
    if (
      coordinatesValues &&
      locationValue !== '' &&
      locationValue !== undefined
    ) {
      // undefined case testen
      // console.log("in first if")
      setterFunctions.setLatitude(coordinatesValues.lat)
      setterFunctions.setLongitude(coordinatesValues.lng)
    } else {
      // console.log("in sec if")
      setterFunctions.setLatitude(undefined)
      setterFunctions.setLongitude(undefined)
    }
  }

  // triggered by slider commit
  const handleSlider = () => {
    setterFunctions.setDistance(distanceValue)
  }

  // anchor for price sort menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  // price filter open
  const open = Boolean(anchorEl)

  const handleSortFilterClose = () => {
    setAnchorEl(null)
  }

  const handleSortFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event?.currentTarget)
  }

  const setFiltersResponsive = () => {
    // appply all saved state values to the setter functions

    // set category
    setterFunctions.setCategory(categoryValue)

    // set price
    managePriceClick()

    // set price sort
    setterFunctions.setSortPrice(sortPriceValue)

    // set stars
    setterFunctions.setSelectedStars(selectedStarsValue)

    // set date
    if (dateValue) {
      setterFunctions.setDateFrom(dateValue[0].toDateString())
      setterFunctions.setDateTo(dateValue[1].toDateString())
    } else {
      setterFunctions.setDateFrom(undefined)
      setterFunctions.setDateTo(undefined)
    }

    // set loaction
    handleLocation()

    // to save for filter remount
    setterFunctions.setLocation(locationValue)

    // set distance
    handleSlider()

    // close drawer
    filterOpenState.setFilterOpen(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        margin: '1rem',
        padding: '2rem',
        border: 1,
        borderColor: 'lightgray',
        borderRadius: '1rem',
        boxShadow: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: '.5rem' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Categories</Typography>
        <List>
          {Object.values(CategoryEnum).map((item, index) => (
            <React.Fragment key={item}>
              {(index <= 3 ||
                (index > 3 && categoryOpenState.categoryOpen === true)) && (
                <ListItemButton
                  key={item}
                  disableRipple
                  onClick={event => {
                    handleCategory(event, item)
                  }}
                  sx={{
                    color: categoryValue === item ? '#1EE6B6' : '#152944',
                    '&:hover': {
                      color: '#1EE6B6',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <ListItemText
                    disableTypography
                    primary={<Typography>{item}</Typography>}
                  />
                </ListItemButton>
              )}

              {index === 3 && categoryOpenState.categoryOpen === false && (
                <CategoryButton onClick={handleOpen}>
                  <Typography>More Categories</Typography>
                  <ExpandMoreIcon />
                </CategoryButton>
              )}
            </React.Fragment>
          ))}
          {categoryOpenState.categoryOpen === true && (
            <CategoryButton onClick={handleOpen}>
              <Typography>Less Categories</Typography>
              <ExpandLessIcon />
            </CategoryButton>
          )}
        </List>
      </Box>

      {/* price filter */}
      <Box sx={{ my: '.5rem' }}>
        <Typography sx={{ fontWeight: 'bold', mb: '.5rem' }}>Price</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: '.5rem' }}>
          <FilterTextField
            placeholder="From"
            type="text"
            value={priceFromValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const inputValue = event.target.value

              // Remove any non-numeric or non-decimal characters except a period
              const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')

              // Check if the sanitized value is a valid price
              if (
                sanitizedValue === '' ||
                /^\d+(\.\d{0,2})?$/.test(sanitizedValue)
              ) {
                setPriceFromValue(sanitizedValue)
              }
            }}
            InputProps={{
              inputProps: { min: 0 },
            }}
          />
          <Typography> - </Typography>
          <FilterTextField
            placeholder="To"
            type="text"
            value={priceToValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const inputValue = event.target.value

              // Remove any non-numeric or non-decimal characters except a period
              const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')

              // Check if the sanitized value is a valid price
              if (
                sanitizedValue === '' ||
                /^\d+(\.\d{0,2})?$/.test(sanitizedValue)
              ) {
                setPriceToValue(sanitizedValue)
              }
            }}
            InputProps={{
              inputProps: { min: 0 },
            }}
          />
          {!isSmallScreen && (
            <IconButton onClick={managePriceClick}>
              <NavigateNextIcon />
            </IconButton>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            mx: '1rem',
          }}
        >
          <Typography sx={{ mr: '1rem', fontWeight: 'bold' }}>
            Sort:{' '}
          </Typography>
          <Button
            sx={{
              border: 1,
              borderColor: 'lightgray',
              borderRadius: '.5rem',
              my: '1rem',
              px: '1rem',
              textTransform: 'none',
              width: '9rem',
              height: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
            onClick={handleSortFilterOpen}
          >
            <Typography
              sx={{
                color: sortPriceValue === 'notUsed' ? 'lightgray' : 'black',
              }}
            >
              {sortPriceValue === 'notUsed' ? 'sort' : sortPriceValue}
            </Typography>
            <KeyboardArrowDownIcon />
          </Button>
          <Menu
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            open={open}
            anchorEl={anchorEl}
            onClose={handleSortFilterClose}
          >
            <MenuItem
              onClick={() => {
                handleSortFilterClose()
                if (!isSmallScreen) {
                  // set directly for not responsive filter
                  setterFunctions.setSortPrice('highest')
                }
                // save in state to use in apply all filters later
                // but applied in both scenarios to display value
                setSortPriceValue('highest')
              }}
            >
              highest
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSortFilterClose()
                if (!isSmallScreen) {
                  // set directly for not responsive filter
                  setterFunctions.setSortPrice('lowest')
                }
                // save in state to use in apply all filters later
                // but apply in both scenarios to display value
                setSortPriceValue('lowest')
              }}
            >
              lowest
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSortFilterClose()
                if (!isSmallScreen) {
                  // set directly for not responsive filter
                  setterFunctions.setSortPrice('none')
                }
                // save in state to use in apply all filters later
                // but apply in both scenarios to display value
                setSortPriceValue('none')
              }}
            >
              none
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Date Filter */}
      <Box sx={{ position: 'relative', my: '.5rem' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Dates</Typography>
        <DateRangePicker
          style={{ width: '12.5rem', position: 'relative', margin: '1rem' }}
          size="lg"
          editable={false}
          character=" – "
          ranges={ranges as RangeType[]}
          showOneCalendar
          placeholder="Select date range"
          shouldDisableDate={beforeToday && beforeToday()}
          onOk={handleDatePicker}
          onClean={handleCleanPicker}
          value={dateValue}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', my: '.5rem' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Minimum Rating</Typography>
        <Rating
          sx={{ m: '1rem' }}
          value={selectedStarsValue}
          onChange={handleStarChange}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          my: '.5rem',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{ fontWeight: 'bold', marginTop: '4px', marginBottom: '4px' }}
          >
            Location
          </Typography>
          {!isSmallScreen && (
            <Tooltip title="Use location input and slider to set filter. To reset the filter, reset both.">
              <InfoIcon
                sx={{
                  color: theme.palette.secondary.main,
                  fontSize: '1.25rem',
                  mx: '.3rem',
                  mb: '.1rem',
                }}
              />
            </Tooltip>
          )}
        </Box>
        <PlacesAutocomplete
          locationValue={locationValue}
          setLocationValue={setLocationValue}
          setCoordinatesValues={setCoordinatesValues}
        />

        <Slider
          sx={{ width: '12.5rem', mx: '1rem', marginTop: '.5rem' }}
          marks={marks}
          disabled={
            locationValue === undefined ||
            (locationValue === '' && inputValues.latitude === undefined)
          }
          defaultValue={0}
          valueLabelDisplay="auto"
          step={5}
          value={distanceValue}
          onChange={(_, value) => {
            if (Array.isArray(value)) {
              setDistanceValue(value[0])
            } else if (value === 0) {
              setDistanceValue(1)
            } else {
              setDistanceValue(value)
            }
          }}
          onChangeCommitted={() => {
            // set slider value
            handleSlider()

            // set coordinate values
            handleLocation()
          }}
        />
      </Box>
      {isSmallScreen && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <GreenButtonBase
            disableRipple
            sx={{
              fontSize: 16,
              height: '3rem',
              width: '11rem',
              marginLeft: '2.5rem',
            }}
            onClick={setFiltersResponsive}
          >
            Apply all Filters
          </GreenButtonBase>
        </Box>
      )}
    </Box>
  )
}
