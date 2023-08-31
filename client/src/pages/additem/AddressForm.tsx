import * as React from 'react'

// mui components
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Box,
  Typography,
  TextField,
} from '@mui/material'

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

import { AddressDto } from '@api/models/AddressDto'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'
import { UsersService } from '@api/services/UsersService'

export default function AddressForm({
  selectedAddress,
  setSelectedAddress,
}: {
  selectedAddress: AddressDto | undefined
  setSelectedAddress: React.Dispatch<
    React.SetStateAction<AddressDto | undefined>
  >
}) {
  const [addresses, setAddresses] = React.useState<AddressDto[]>([])
  const [openDialog, setOpenDialog] = React.useState(false)

  const [newAddress, setNewAddress] = React.useState<AddressDto>({
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

  const handleAddressClick = (address: AddressDto) => {
    setSelectedAddress(address)
  }

  const handleAddAddressClick = () => {
    setOpenDialog(true)
  }

  const handleClose = () => {
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

  const { userId } = React.useContext(AuthContext)
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()

  const fetchAddresses = React.useCallback(async () => {
    if (userId) {
      const retrievedAddresses = await UsersService.getUserAddressesById(userId)
      setAddresses(retrievedAddresses)

      if (!selectedAddress && retrievedAddresses.length > 0) {
        setSelectedAddress(retrievedAddresses[0])
      }
    } else {
      showSnackBarWithMessage('Please log in to see your addresses', 'error')
    }
  }, [selectedAddress, setSelectedAddress, userId, showSnackBarWithMessage])

  React.useEffect(() => {
    const initialAddressFetch = async () => {
      await fetchAddresses()
    }

    initialAddressFetch()
  }, [fetchAddresses])

  const addAddress = async () => {
    try {
      if (userId) {
        if (newAddress.street === '' || newAddress.street === ' ') {
          showSnackBarWithMessage('Please select a valid address.', 'error')
        } else if (!newAddress.street.match(/\d/)) {
          showSnackBarWithMessage('Please enter a house number.', 'error')
        } else {
          await UsersService.createUserAddress(userId, newAddress)
          handleClose()
          fetchAddresses()
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
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Choose address
      </Typography>
      <List component="nav">
        {addresses.map((address, index) => (
          <ListItemButton
            key={`Address ${index + 1}`}
            onClick={() => handleAddressClick(address)}
            selected={selectedAddress?.id === address.id}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  color:
                    selectedAddress?.id === address.id
                      ? 'white'
                      : 'primary.main',
                  backgroundColor:
                    selectedAddress?.id === address.id
                      ? 'secondary.main'
                      : 'rgba(32, 33, 37, 0.08)',
                }}
              >
                <LocationOnIcon sx={{ fontSize: '30px' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={address.street}
              secondary={`${address.city}, ${address.zipCode}`}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={handleAddAddressClick} variant="contained">
          <Typography>Add new address</Typography>
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold" align="center">
          Add address
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={addAddress}
            variant="contained"
            color="secondary"
            disabled={!locationValue}
            sx={{
              fontWeight: 'bold',
            }}
          >
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
