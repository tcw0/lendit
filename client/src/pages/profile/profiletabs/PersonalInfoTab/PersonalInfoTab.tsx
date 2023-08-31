import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { ItemMetaDataDto } from '@api/models/ItemMetaDataDto'
import { UsersService } from '@api/services/UsersService'
import { RentalsService } from '@api/services/RentalsService'
import { AuthContext } from 'src/context/AuthContext'
import { SnackbarContext } from 'src/context/SnackbarContext'
import { UserDto } from '@api/models/UserDto'
import { RentalMetadataDto } from '@api/models/RentalMetadataDto'
import LastItemCard from './LastItemCard'
import LastRentalCard from './LastRentalCard'
import UserInfoBox from './UserInfoBox'

export default function PersonalInfoTab() {
  const { showSnackBarWithError } = React.useContext(SnackbarContext)
  const { userId } = React.useContext(AuthContext)

  const [lastRentals, setLastRentals] = useState<RentalMetadataDto[]>([])
  const [myItems, setMyItems] = useState<ItemMetaDataDto[]>([])
  const [user, setUser] = React.useState<UserDto | undefined>(undefined)

  // Reload user data on update
  const fetchUser = useCallback(async () => {
    if (userId) {
      try {
        const user: UserDto = await UsersService.getUserById(userId)
        setUser(user)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }, [userId, showSnackBarWithError])

  // Fetch user data on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Fetch user items as metadata to display on profile page
  const fetchUserItems = useCallback(async () => {
    if (userId) {
      try {
        const userItems: ItemMetaDataDto[] = await UsersService.getUserItems(
          userId,
        )
        setMyItems(userItems)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }, [userId, showSnackBarWithError])

  // Fetch last rentals to display on profile page
  const fetchLastRentals = useCallback(async () => {
    if (userId) {
      try {
        const rentals: RentalMetadataDto[] =
          await RentalsService.getAllRentals()
        setLastRentals(rentals)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }, [userId, showSnackBarWithError])

  // Fetch user items and last rentals on mount
  useEffect(() => {
    fetchUserItems()
    fetchLastRentals()
  }, [fetchUserItems, fetchLastRentals])

  // Update item in myItems array on updating, e.g. the picture
  const updateAndReplaceItem = (item: ItemMetaDataDto) => {
    const newItems = [...myItems]
    const index = newItems.findIndex(i => i.id === item.id)
    if (index !== -1) {
      newItems[index] = item
      setMyItems(newItems)
    }
  }

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        {/* High level profile info section */}
        {user && <UserInfoBox user={user} reloadUserData={fetchUser} />}

        {/* My Items section */}
        <Typography variant="h6" align="left">
          My Items
        </Typography>

        <Box display="flex" justifySelf="center" gap={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              flexWrap: 'wrap',
              py: 1,
              px: 3,
              gap: 4,
              maxWidth: '1500px',
            }}
          >
            {myItems?.length > 0 ? (
              myItems.map(item => (
                <LastItemCard
                  key={item.id}
                  item={item}
                  updateItem={updateAndReplaceItem}
                />
              ))
            ) : (
              <Typography>No Items yet</Typography>
            )}
          </Box>
        </Box>

        <Typography variant="h6" align="left" mt={3}>
          Last Rentals
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              flexWrap: 'wrap',
              py: 1,
              px: 3,
              gap: 4,
              maxWidth: '1500px',
            }}
          >
            {lastRentals?.length > 0 ? (
              lastRentals.map(item => (
                <LastRentalCard key={item.id} rental={item} />
              ))
            ) : (
              <Typography>No rentals yet</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}
