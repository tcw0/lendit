import React from 'react'

// mui components
import { Link, Button, TextField, Box } from '@mui/material'

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

// references
import { NewUserDto } from '@api/models/NewUserDto'
import { AddressDto } from '@api/models/AddressDto'
import { UsersService } from '@api/services/UsersService'
import { SnackbarContext } from 'src/context/SnackbarContext'

export default function Signup({ handleClose }: { handleClose: () => void }) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [repeatedPassword, setRepeatedPassword] = React.useState('')
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

  const checkPasswords = () => {
    return repeatedPassword === password
  }

  const { showSnackBarWithError, showSnackBarWithMessage } =
    React.useContext(SnackbarContext)

  const sendSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newAddress.street === '') {
      showSnackBarWithMessage('Please select a valid address.', 'error')
    } else if (!newAddress.street.match(/\d/)) {
      showSnackBarWithMessage('Please enter a house number.', 'error')
    } else {
      const newUser: NewUserDto = {
        name,
        email: email.toLowerCase(),
        password,
        address: newAddress,
      }

      try {
        await UsersService.createUser(newUser)
        handleClose()
        showSnackBarWithMessage('User created successfully.', 'success')
      } catch (error) {
        showSnackBarWithError(error)
      }
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
    <Box component="form" onSubmit={sendSignup} noValidate>
      <TextField
        label="Name"
        type="text"
        id="name"
        name="name"
        required
        fullWidth
        size="small"
        margin="dense"
        autoComplete="off"
        value={name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setName(event.target.value)
        }}
      />
      <TextField
        label="Email"
        type="email"
        id="email"
        name="email"
        required
        fullWidth
        size="small"
        margin="dense"
        autoComplete="off"
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(event.target.value)
        }}
      />
      <TextField
        label="Password"
        type="password"
        id="password"
        name="password"
        required
        fullWidth
        size="small"
        margin="dense"
        value={password}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value)
        }}
      />
      <TextField
        label="Repeat Password"
        type="password"
        id="repeat-password"
        name="repeat-password"
        required
        fullWidth
        size="small"
        margin="dense"
        value={repeatedPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setRepeatedPassword(event.target.value)
        }}
        error={!checkPasswords()}
        helperText={!checkPasswords() && 'Passwords do not match'}
      />
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
          size="small"
          margin="dense"
          fullWidth
          required
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

      {/* primary={newAddress.street}
                  secondary={`${newAddress.zipCode}, ${newAddress.city}`} */}

      <Link href="/" variant="body2">
        Privacy Policy
      </Link>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={
          !name ||
          !email ||
          !password ||
          !repeatedPassword ||
          !locationValue ||
          !checkPasswords()
        }
        sx={{
          mt: 3,
          mb: 2,
          fontSize: 20,
          fontWeight: 'bold',
          textTransform: 'none',
        }}
      >
        Sign up
      </Button>
    </Box>
  )
}
