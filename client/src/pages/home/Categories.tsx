import React from 'react'

// mui components
import { Box, Tabs, Tab } from '@mui/material'

// mui icons
import HandymanIcon from '@mui/icons-material/Handyman'
import DevicesIcon from '@mui/icons-material/Devices'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import CleanHandsIcon from '@mui/icons-material/CleanHands'
import LocalDiningIcon from '@mui/icons-material/LocalDining'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import WidgetsIcon from '@mui/icons-material/Widgets'

// references
import { CategoryEnum } from '@api/models/CategoryEnum'
import ItemCards from './ItemCards'

/**
 * Matching icons for categories
 * @param category instance of CategoryEnum
 * @returns mui icon
 */
function categoryIcon(category: CategoryEnum) {
  switch (category) {
    case CategoryEnum.TOOLS:
      return <HandymanIcon />
    case CategoryEnum.ELECTRONICS:
      return <DevicesIcon />
    case CategoryEnum.GARDEN:
      return <LocalFloristIcon />
    case CategoryEnum.CLEANING:
      return <CleanHandsIcon />
    case CategoryEnum.COOKING:
      return <LocalDiningIcon />
    case CategoryEnum.CLOTHING:
      return <CheckroomIcon />
    case CategoryEnum.ACCESSORIES:
      return <KeyboardIcon />
    case CategoryEnum.MUSIC:
      return <MusicNoteIcon />
    case CategoryEnum.OTHER:
      return <WidgetsIcon />
    default:
      return ''
  }
}

/**
 * Categories tabs and corresponding featured items
 */
export default function Categories() {
  const [selectedCategory, setSelectedCategory] = React.useState(
    CategoryEnum.TOOLS,
  )

  const handleChange = (_: React.SyntheticEvent, newValue: CategoryEnum) => {
    setSelectedCategory(newValue)
  }

  return (
    <>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '100vw',
        }}
      >
        <Tabs
          value={selectedCategory}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {Object.values(CategoryEnum).map(category => (
            <Tab
              value={category}
              key={category}
              icon={categoryIcon(category)}
              label={category}
            />
          ))}
        </Tabs>
      </Box>
      <ItemCards category={selectedCategory} />
    </>
  )
}
