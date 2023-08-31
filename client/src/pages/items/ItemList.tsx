import React from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
// import { PictureDto } from '@api/models/PictureDto'
// import { AddressDto } from '@api/models/AddressDto'
// import { AggregatedRatingDto } from '@api/models/AggregatedRatingDto'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { sortBy, filter } from 'lodash'
import ItemListCard from './ItemListCard'
import { InputValues } from './Types'
import { ItemsService } from '../../../../api/generated/services/ItemsService'
import { useResponsive } from '../../context/ResponsiveContext'
import ItemCard from '../home/ItemCard'

export default function ItemList({
  inputValues: {
    searchInput,
    category,
    priceFrom,
    priceTo,
    dateFrom,
    dateTo,
    latitude,
    longitude,
    distance,
    sortPrice,
    selectedStars,
  },
}: {
  inputValues: InputValues
}) {
  const [items, setItems] = React.useState<ItemMetaDataDto[] | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    const fetchItems = async () => {
      // set loading to display skeleton
      setLoading(true)
      const response = await ItemsService.searchItem(
        searchInput,
        category,
        priceFrom,
        priceTo,
        dateFrom,
        dateTo,
        latitude,
        longitude,
        undefined,
        distance,
      )
      setItems(response)
    }

    fetchItems()
  }, [
    searchInput,
    category,
    priceFrom,
    priceTo,
    dateFrom,
    dateTo,
    latitude,
    longitude,
    distance,
  ])

  const { isSmallScreen } = useResponsive()

  const [sortedItems, setSortedItems] = React.useState<ItemMetaDataDto[]>()

  React.useEffect(() => {
    const createSortedArray = () => {
      if (items !== null) {
        let sortedArr: ItemMetaDataDto[] = items
        if (sortPrice !== 'notUsed' && sortPrice !== 'none') {
          // sort price descending
          if (sortPrice === 'highest') {
            sortedArr = sortBy(items, item => -item.priceFirstDay)
          }
          // sort price ascending
          if (sortPrice === 'lowest') {
            sortedArr = sortBy(items, item => item.priceFirstDay)
          }
        }
        if (selectedStars) {
          // sort highest rated items first
          sortedArr = filter(
            sortedArr,
            item => item.avgRating.avgRating >= selectedStars,
          )
        }
        setSortedItems(sortedArr)
      }
    }
    createSortedArray()
    // reset loading to undisplay skeleton
    setLoading(false)
  }, [items, sortPrice, selectedStars])

  function renderList(): React.ReactNode {
    return sortedItems && sortedItems.length > 0 ? (
      sortedItems.map(item =>
        isSmallScreen ? (
          <ItemCard key={item.id} item={item} />
        ) : (
          <ItemListCard key={item.id} item={item} />
        ),
      )
    ) : (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          mx: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderRadius: '1rem',
          boxShadow: 2,
          borderColor: 'lightgray',
          my: '1rem',
          px: '1rem',
        }}
      >
        <SentimentVeryDissatisfiedIcon sx={{ fontSize: '2rem' }} />
        <Typography sx={{ textAlign: 'justify', m: '1rem' }}>
          No items matching your search...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: isSmallScreen ? undefined : '100%',
        minWidth: isSmallScreen ? undefined : '500px',
        flexDirection: isSmallScreen ? undefined : 'column',

        justifyContent: isSmallScreen ? 'center' : undefined,
        flexWrap: isSmallScreen ? 'wrap' : undefined,
        alignItems: isSmallScreen ? 'stretch' : undefined,
        py: 1,
        px: 3,
        gap: 1,
      }}
    >
      {items !== null && loading === false ? (
        renderList()
      ) : (
        <Box
          sx={{
            m: '2rem',
            ml: '3rem',
            mt: '5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Skeleton variant="circular" width={25} height={25} />
          <Skeleton
            sx={{ mx: '1rem' }}
            variant="circular"
            width={25}
            height={25}
          />
          <Skeleton variant="circular" width={25} height={25} />
        </Box>
      )}
    </Box>
  )
}
