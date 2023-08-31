import { CategoryEnum } from '@api/models/CategoryEnum'
// import { DateRange } from 'rsuite/esm/DateRangePicker'

export type SetterFunctions = {
  setCategory: React.Dispatch<React.SetStateAction<CategoryEnum | undefined>>
  setPriceFrom: React.Dispatch<React.SetStateAction<number | undefined>>
  setPriceTo: React.Dispatch<React.SetStateAction<number | undefined>>
  setDateFrom: React.Dispatch<React.SetStateAction<string | undefined>>
  setDateTo: React.Dispatch<React.SetStateAction<string | undefined>>
  setLocation: React.Dispatch<React.SetStateAction<string | undefined>>
  setLatitude: React.Dispatch<React.SetStateAction<number | undefined>>
  setLongitude: React.Dispatch<React.SetStateAction<number | undefined>>
  setDistance: React.Dispatch<React.SetStateAction<number | undefined>>
  setSortPrice: React.Dispatch<React.SetStateAction<string>>
  setSelectedStars: React.Dispatch<React.SetStateAction<number | null>>
}

export type InputValues = {
  searchInput: string
  category?: CategoryEnum
  priceFrom?: number
  priceTo?: number
  dateFrom?: string
  dateTo?: string
  location?: string
  latitude?: number
  longitude?: number
  distance?: number
  sortPrice: string
  selectedStars: number | null
}

export type CategoryOpenState = {
  categoryOpen: boolean
  setCategoryOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type FilterOpenState = {
  filterOpen: boolean
  setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>
}
