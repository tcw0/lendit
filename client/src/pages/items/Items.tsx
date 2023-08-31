import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import {
  Box,
  Button,
  DialogTitle,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material'
import { CategoryEnum } from '@api/models/CategoryEnum'
import TuneIcon from '@mui/icons-material/Tune'
import Map from 'src/components/Map'
import MapIcon from '@mui/icons-material/Map'
import Footer from 'src/components/Footer'
import { SearchContext } from '../../context/SearchContextProvider'

import ItemList from './ItemList'
import FilterSidebar from './FilterSidebar'
import {
  InputValues,
  CategoryOpenState,
  SetterFunctions,
  FilterOpenState,
} from './Types'
import { useResponsive } from '../../context/ResponsiveContext'
import CloseButton from '../../components/buttons/CloseButton'
import theme from '../../Theme'

export default function Items() {
  const [isMapOpen, setIsMapOpen] = useState(false)
  // search Input
  const searchContext = useContext(SearchContext)
  const searchInput = searchContext.finalInput

  // category filter
  const [category, setCategory] = useState<CategoryEnum | undefined>(undefined)

  // price filter
  const [priceFrom, setPriceFrom] = useState<number | undefined>(undefined)
  const [priceTo, setPriceTo] = useState<number | undefined>(undefined)

  // date filter
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)

  // location filter
  const [location, setLocation] = useState<string | undefined>(undefined)
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [distance, setDistance] = useState<number | undefined>(undefined)

  // categories list open / collapsed state
  const [categoryOpen, setCategoryOpen] = useState(false)

  // sort price ascending / descending
  const [sortPrice, setSortPrice] = React.useState<string>('notUsed')

  // only highest ratings sorting
  const [selectedStars, setSelectedStars] = React.useState<number | null>(null)

  const categoryOpenState: CategoryOpenState = {
    categoryOpen,
    setCategoryOpen,
  }

  // drawer open state
  const [filterOpen, setFilterOpen] = useState(false)

  const filterOpenState: FilterOpenState = {
    filterOpen,
    setFilterOpen,
  }

  const setterFunctions: SetterFunctions = {
    setCategory,
    setPriceFrom,
    setPriceTo,
    setDateFrom,
    setDateTo,
    setLocation,
    setLatitude,
    setLongitude,
    setDistance,
    setSortPrice,
    setSelectedStars,
  }

  const inputValues: InputValues = {
    searchInput,
    category,
    priceFrom,
    priceTo,
    dateFrom,
    dateTo,
    location,
    latitude,
    longitude,
    distance,
    sortPrice,
    selectedStars,
  }

  const { isSmallScreen } = useResponsive()

  const FilterButton = styled('div')(({ theme }) => ({
    color: theme.palette.primary.main,
    '&:hover': {
      color: 'white',
    },
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '10%',
    width: '7rem',
    height: '3rem',
    padding: '0px',
    marginLeft: '.5rem',
    marginBottom: '.5rem',
    display: 'flex',
    alignItems: 'center',
  }))

  if (!isSmallScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          margin: 'auto',
          width: '90%',
          maxWidth: '1300px',
          paddingTop: '1.5rem',
        }}
      >
        <Box sx={{ flex: '20%', position: 'sticky' }}>
          <FilterSidebar
            setterFunctions={setterFunctions}
            inputValues={inputValues}
            categoryOpenState={categoryOpenState}
            filterOpenState={filterOpenState}
          />
        </Box>
        <Box sx={{ flex: '80%', minWidth: '400px' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button onClick={() => setIsMapOpen(!isMapOpen)}>
              <MapIcon /> {isMapOpen ? 'Close Map' : 'Open Map'}
            </Button>
          </Box>

          {isMapOpen ? (
            <Map inputValues={inputValues} />
          ) : (
            <ItemList inputValues={inputValues} />
          )}
        </Box>
      </Box>
    )
  }
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          margin: 'auto',
          width: '90%',
          maxWidth: '1000px',
          paddingTop: '1.5rem',
        }}
      >
        <FilterButton>
          <IconButton
            onClick={() => {
              setFilterOpen(true)
            }}
            sx={{
              color: 'inherit',
              borderRadius: '0',
              width: '100%',
              height: '100%',
              padding: 0,
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>Filters</Typography>
            <TuneIcon sx={{ color: 'inherit', fontSize: 25, marginLeft: 1 }} />
          </IconButton>
        </FilterButton>

        <ItemList inputValues={inputValues} />

        <Drawer
          open={filterOpen}
          anchor="left"
          PaperProps={{
            sx: { height: '100%', zIndex: -1 },
          }}
          onClose={() => {
            setFilterOpen(false)
          }}
        >
          <DialogTitle
            sx={{
              position: 'sticky',
              top: 0,
              height: '3.5rem',
              backgroundColor: theme.palette.secondary.main,
              zIndex: theme.zIndex.appBar + 1,
            }}
          >
            <Typography
              sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
            >
              Filters
            </Typography>
            <CloseButton
              handleClose={() => {
                setFilterOpen(false)
              }}
            />
          </DialogTitle>
          <FilterSidebar
            setterFunctions={setterFunctions}
            inputValues={inputValues}
            categoryOpenState={categoryOpenState}
            filterOpenState={filterOpenState}
          />
        </Drawer>
      </Box>
      <Footer />
    </>
  )
}
