import { AddressDto } from '@api/models/AddressDto'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { ItemsService } from '@api/services/ItemsService'
import { UsersService } from '@api/services/UsersService'
import React from 'react'
import ReactMapGL, { Marker, Popup } from 'react-map-gl'
import { AuthContext } from 'src/context/AuthContext'
import { InputValues } from 'src/pages/items/Types'

// icons
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import { Box, Typography } from '@mui/material'
import { displayRating, intToPrice } from 'src/helper/helper'
import lenditLogo from 'src/assets/lenditLogo.png'
import { useNavigate } from 'react-router-dom'

export default function Map({
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
  },
}: {
  inputValues: InputValues
}) {
  const [items, setItems] = React.useState<ItemMetaDataDto[]>([])
  const [selectedItem, setSelectedItem] =
    React.useState<ItemMetaDataDto | null>(null)
  const [center, setCenter] = React.useState({
    longitude: 11.0244,
    latitude: 48.03453,
  })
  const authContext = React.useContext(AuthContext)
  const navigate = useNavigate()

  React.useEffect(() => {
    const fetchItems = async () => {
      const response = await ItemsService.searchItem(
        searchInput,
        category,
        priceFrom,
        priceTo,
        dateFrom,
        dateTo,
        latitude,
        longitude,
        false,
        distance,
      )
      // const response = [ItemData1, ItemData2, ItemData3, ItemData4]
      setItems(response)
    }

    const fetchLocation = async () => {
      // Set Center of Map location based on Input provided by user
      if (longitude && latitude) {
        setCenter({
          longitude,
          latitude,
        })
        // Otherwise set Center of Map as location of userAddress
      } else if (authContext.userId) {
        const addresses: AddressDto[] = await UsersService.getUserAddressesById(
          authContext.userId,
        )
        setCenter({
          longitude: addresses[0].longitude,
          latitude: addresses[0].latitude,
        })
      }
    }

    fetchItems()
    fetchLocation()
  }, [
    searchInput,
    category,
    priceFrom,
    priceTo,
    dateFrom,
    dateTo,
    longitude,
    latitude,
    distance,
    authContext.userId,
  ])

  // Transform into latitude longitude object

  const [viewState, setViewState] = React.useState({
    latitude: center.latitude,
    longitude: center.longitude,
    zoom: 8,
  })

  return (
    <>
      <ReactMapGL
        style={{ width: '100%', height: '800px' }}
        mapStyle="mapbox://styles/lendit-seba/clk04c9uf008y01qy03ekeuwu"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX}
        latitude={viewState.latitude}
        longitude={viewState.longitude}
        zoom={viewState.zoom}
        onMove={evt => setViewState(evt.viewState)}
      >
        {items.map(result => {
          if (
            result.location.latitude < 90 &&
            result.location.latitude > -90 &&
            result.location.longitude < 180 &&
            result.location.longitude > -180
          ) {
            return (
              <div
                key={result.id}
                onMouseEnter={() => setSelectedItem(result)}
                onMouseLeave={() => setSelectedItem(null)}
              >
                <Marker
                  longitude={result.location.longitude}
                  latitude={result.location.latitude}
                  onClick={() => {
                    navigate(`/items/${result.id}`)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <LocationOnIcon
                    sx={{
                      color: 'red',
                      fontWeight: 'medium',
                      fontSize: 'medium',
                    }}
                  />
                </Marker>
                {selectedItem === result && (
                  <Popup
                    latitude={result.location.latitude}
                    longitude={result.location.longitude}
                    closeButton
                    closeOnClick={false}
                    onClose={() => setSelectedItem(null)}
                    anchor="top"
                    maxWidth="300"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ marginRight: 2 }}>
                        <img
                          src={selectedItem?.picture?.url || lenditLogo}
                          alt={selectedItem?.title}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: '16px', fontWeight: 'bold' }}
                        >
                          {selectedItem.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                          <StarRateRoundedIcon sx={{ fontSize: 'small' }} />
                          <Typography sx={{ fontSize: '14px' }}>
                            {displayRating(selectedItem.avgRating)}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ fontSize: '16px', fontWeight: 'bold' }}
                        >
                          {intToPrice(selectedItem.priceFirstDay)} first day
                        </Typography>
                        <Typography sx={{ color: 'grey', fontSize: '16px' }}>
                          {intToPrice(selectedItem.pricePerDay)} per extra day
                        </Typography>
                      </Box>
                    </Box>
                  </Popup>
                )}
              </div>
            )
          }
          return false
        })}
      </ReactMapGL>
    </>
  )
}
