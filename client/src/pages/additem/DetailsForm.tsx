import * as React from 'react'

// mui components
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material'

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import { CategoryEnum } from '@api/models/CategoryEnum'
import { PictureDto } from '@api/models/PictureDto'
import DraggableImageList from './DraggableImageList'

export default function DetailsForm({
  images,
  setImages,
  title,
  setTitle,
  selectedCategories,
  setSelectedCategories,
  description,
  setDescription,
  priceFirstDay,
  setPriceFirstDay,
  pricePerDay,
  setPricePerDay,
  mandatoryInsurance,
  setMandatoryInsurance,
}: {
  images: (File | PictureDto)[]
  setImages: React.Dispatch<React.SetStateAction<(File | PictureDto)[]>>
  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  selectedCategories: CategoryEnum[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<CategoryEnum[]>>
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
  priceFirstDay: string
  setPriceFirstDay: React.Dispatch<React.SetStateAction<string>>
  pricePerDay: string
  setPricePerDay: React.Dispatch<React.SetStateAction<string>>
  mandatoryInsurance: boolean
  setMandatoryInsurance: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Item Details
      </Typography>

      <DraggableImageList images={images} setImages={setImages} />

      <Grid
        container
        columns={{ xs: 5, sm: 12 }}
        justifyContent="start"
        alignItems="center"
        rowSpacing={1}
        columnSpacing={2}
        pt={3}
      >
        <Grid item xs={2}>
          <Typography fontWeight="bold">Title*</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            type="text"
            id="title"
            name="title"
            required
            fullWidth
            size="small"
            margin="dense"
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(event.target.value)
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Categories*</Typography>
        </Grid>
        <Grid item xs={10}>
          <Select
            multiple
            displayEmpty
            value={selectedCategories}
            onChange={event => {
              setSelectedCategories(event.target.value as CategoryEnum[])
            }}
            renderValue={selected => {
              if (selected.length === 0) {
                return <em>Choose Categories</em>
              }

              return (selected as CategoryEnum[]).join(', ')
            }}
            sx={{ minWidth: 200 }}
          >
            {Object.values(CategoryEnum).map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Description*</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            type="text"
            id="description"
            name="description"
            required
            fullWidth
            multiline
            minRows={5}
            maxRows={10}
            size="small"
            margin="dense"
            value={description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDescription(event.target.value)
            }}
          />
        </Grid>
        <Grid item xs={2} display="flex" alignItems="center">
          <Typography fontWeight="bold">Price*</Typography>
          <Tooltip title="Enter the price for the first day of a rental and the price for each subsequent day">
            <HelpOutlineIcon
              fontSize="small"
              sx={{ marginLeft: '4px', color: 'grey' }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={5}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography minWidth={90} fontWeight="bold">
              First day:
            </Typography>
            <TextField
              type="text"
              id="price-first-day"
              name="price-first-day"
              required
              fullWidth
              size="small"
              margin="dense"
              value={priceFirstDay}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const inputValue = event.target.value

                // Remove any non-numeric or non-decimal characters except a period
                const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')

                // Check if the sanitized value is a valid price
                if (
                  sanitizedValue === '' ||
                  /^\d+(\.\d{0,2})?$/.test(sanitizedValue)
                ) {
                  setPriceFirstDay(sanitizedValue)
                }
              }}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={5}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography minWidth={90} fontWeight="bold">
              Next days:
            </Typography>
            <TextField
              type="text"
              id="price-per-day"
              name="price-per-day"
              required
              fullWidth
              size="small"
              margin="dense"
              value={pricePerDay}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const inputValue = event.target.value

                // Remove any non-numeric or non-decimal characters except a period
                const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')

                // Check if the sanitized value is a valid price
                if (
                  sanitizedValue === '' ||
                  /^\d+(\.\d{0,2})?$/.test(sanitizedValue)
                ) {
                  setPricePerDay(sanitizedValue)
                }
              }}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Insurance</Typography>
        </Grid>
        <Grid item xs={10}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={mandatoryInsurance}
                  onChange={event => {
                    setMandatoryInsurance(event.target.checked)
                  }}
                  color="primary"
                />
              }
              label="Mandatory to rent item"
            />
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
