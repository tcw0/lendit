import React, { useEffect, useState, useContext, useCallback } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Avatar,
  TextField,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox'

import { AuthContext } from 'src/context/AuthContext'
import { UsersService } from '@api/services/UsersService'
import { useSnackbar } from 'src/context/SnackbarContext'
import { AddressDto } from '@api/models/AddressDto'
import CloseButton from 'src/components/buttons/CloseButton'

// Addresses Tab
export default function AddressesTab() {
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()
  const { userId } = useContext(AuthContext)
  const [addresses, setAddresses] = useState<AddressDto[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [editedAddress, setEditAddress] = useState(0)

  const [newAddress, setNewAddress] = useState<AddressDto>({
    id: '',
    street: '',
    zipCode: '',
    city: '',
    longitude: 0,
    latitude: 0,
  })

  const {
    ready,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete()

  const [locationValue, setLocationValue] = React.useState('')

  const fetchAddress = useCallback(async () => {
    try {
      if (userId) {
        const addresses = await UsersService.getUserAddressesById(userId)
        setAddresses(addresses)
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }, [userId, showSnackBarWithError])

  useEffect(() => {
    fetchAddress()
  }, [fetchAddress])

  const handleOpenDialogEdit = (address: AddressDto) => {
    setNewAddress(address)
    setEditAddress(addresses.indexOf(address))
    setEditDialog(true)
    setOpenDialog(true)
  }

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setNewAddress({
      id: '',
      street: '',
      zipCode: '',
      city: '',
      longitude: 0,
      latitude: 0,
    })
    setLocationValue('')
  }

  const handleAddAddress = async () => {
    try {
      if (userId) {
        if (newAddress.street === '' || newAddress.street === ' ') {
          showSnackBarWithMessage('Please select a valid address.', 'error')
        } else if (!newAddress.street.match(/\d/)) {
          showSnackBarWithMessage('Please enter a house number.', 'error')
        } else {
          await UsersService.createUserAddress(userId, newAddress)
          handleCloseDialog()
        }
      } else {
        showSnackBarWithMessage('Please log in to add a new address', 'error')
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  const handleUpdateAddress = async () => {
    try {
      if (userId) {
        if (newAddress.street === '' || newAddress.street === ' ') {
          showSnackBarWithMessage('Please select a valid address.', 'error')
        } else if (!newAddress.street.match(/\d/)) {
          showSnackBarWithMessage('Please enter a house number.', 'error')
        } else {
          const updatedAddress: AddressDto =
            await UsersService.updateUserAddressById(
              userId,
              addresses[editedAddress].id,
              newAddress,
            )
          setAddresses(prevAddresses => {
            const newAddresses = [...prevAddresses]
            newAddresses[editedAddress] = updatedAddress
            return newAddresses
          })
          handleCloseDialog()
        }
      } else {
        showSnackBarWithMessage('Please log in to add a new address', 'error')
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  // get geoCode and lat, lng values
  const handleSelect = async (address: string) => {
    clearSuggestions()

    // to display in input field
    setLocationValue(address)

    const results = await getGeocode({ address })
    const { lat, lng } = await getLatLng(results[0])
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { address_components } = results[0]

    let street = ''
    let houseNumber = ''
    let postalCode = ''
    let city = ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address_components.forEach((component: any) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { types, long_name } = component

      if (types.includes('street_number')) {
        houseNumber = long_name
      } else if (types.includes('route')) {
        street = long_name
      } else if (types.includes('postal_code')) {
        postalCode = long_name
      } else if (types.includes('locality')) {
        city = long_name
      }
    })

    setNewAddress(prevDetails => ({
      ...prevDetails,
      street: `${street} ${houseNumber}`,
      zipCode: postalCode,
      city,
      longitude: lng,
      latitude: lat,
    }))
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        p={2}
      >
        <Typography variant="h5">Addresses Information</Typography>
        <List>
          {addresses.map((address, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={address.street + index}>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
                p={1}
                width="100%"
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      color: 'primary.main',
                      backgroundColor: 'rgba(32, 33, 37, 0.08)',
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: '30px' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={address.street}
                  secondary={`${address.zipCode}, ${address.city}`}
                />
                <IconButton
                  onClick={() => handleOpenDialogEdit(address)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenDialog}
        >
          Add New Address
        </Button>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight="bold">
          {editDialog ? 'Edit Address' : 'Add New Address'}
          <CloseButton handleClose={handleCloseDialog} />
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              marginTop: '8px',
              marginBottom: '4px',
            }}
          >
            <Combobox onSelect={handleSelect}>
              <ComboboxInput
                as={TextField}
                label="Address"
                value={locationValue}
                onChange={e => {
                  setValue(e.target.value)
                  setLocationValue(e.target.value)
                }}
                disabled={!ready}
                fullWidth
                size="small"
                margin="dense"
                inputProps={{
                  autoComplete: 'new-password',
                }}
              />
              <ComboboxPopover className="autocomplete-popover">
                <ComboboxList className="autocomplete-list">
                  {status === 'OK' &&
                    data.map(({ place_id, description }) => (
                      <ComboboxOption key={place_id} value={description} />
                    ))}
                </ComboboxList>
              </ComboboxPopover>
            </Combobox>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          {editDialog ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdateAddress}
            >
              Update Address
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddAddress}
            >
              Add Address
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
