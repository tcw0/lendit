import React from 'react'

// mui components
import { Box } from '@mui/material'

// references
import { CategoryEnum } from '@api/models/CategoryEnum'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { ItemsService } from '@api/services/ItemsService'
import { SnackbarContext } from 'src/context/SnackbarContext'
import ItemCard from './ItemCard'

/**
 * ItemCards of featured items based on category
 * @param category instance of CategoryEnum
 */
export default function ItemCards({ category }: { category: CategoryEnum }) {
  const [featuredItems, setFeaturedItems] = React.useState<ItemMetaDataDto[]>(
    [],
  )

  const snackbarContext = React.useContext(SnackbarContext)

  React.useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await ItemsService.featuredItems(category)
        setFeaturedItems(response)
      } catch (error) {
        snackbarContext.showSnackBarWithError(error)
      }
    }

    fetchFeaturedItems()
  }, [category, snackbarContext])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          py: 1,
          px: 3,
          gap: 4,
          maxWidth: '1800px',
        }}
      >
        {featuredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  )
}
