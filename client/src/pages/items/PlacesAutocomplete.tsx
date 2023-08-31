import React from 'react'
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

import { TextField } from '@mui/material'

type PlacesAutocompleteProps = {
  locationValue: string | undefined
  setLocationValue: React.Dispatch<React.SetStateAction<string | undefined>>
  setCoordinatesValues: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | undefined>
  >
}

export default function PlacesAutocomplete({
  locationValue,
  setLocationValue,
  setCoordinatesValues,
}: PlacesAutocompleteProps) {
  const {
    ready,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete()

  // get geoCode and lat, lng values<
  const handleSelect = async (address: string) => {
    clearSuggestions()

    // to display in input field
    setLocationValue(address)

    const results = await getGeocode({ address })
    const { lat, lng } = await getLatLng(results[0])
    setCoordinatesValues({ lat, lng })
  }

  return (
    <Combobox
      onSelect={handleSelect}
      style={{ width: '90%' }}
      className="autocomplete-container"
    >
      <ComboboxInput
        as={TextField}
        placeholder="Search address"
        className="autocomplete-input"
        value={locationValue}
        onChange={e => {
          // only for suggestions
          setValue(e.target.value)
          // for display in input
          setLocationValue(e.target.value)
        }}
        disabled={!ready}
        fullWidth
        size="small"
        margin="dense"
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
  )
}
