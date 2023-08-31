import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { RentalMetadataDto } from '@api/models/RentalMetadataDto'
import { RentalDto } from '@api/models/RentalDto'
import { RentalsService } from '@api/services/RentalsService'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'
import { useResponsive } from 'src/context/ResponsiveContext'
import { Chat, Close } from '@mui/icons-material'
import RentalStepper from './RentalStepper/RentalStepper'
import MessageList from './MessageList/MessageList'
import ChatView from './ChatView/ChatView'
import DrawerMessageList from './MessageList/DrawerMessageList'

export default function Rentals(): JSX.Element {
  const { rentalID } = useParams()

  const { isSmallScreen } = useResponsive()
  const { showSnackBarWithError } = useSnackbar()
  const { userId } = useContext(AuthContext)

  const [currentRental, setCurrentRental] = useState<RentalDto | undefined>(
    undefined,
  )
  const [rentals, setRentals] = useState<RentalMetadataDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [role, setRole] = useState<RentalRoleEnum>(RentalRoleEnum.RENTER)
  const [tabValue, setTabValue] = useState<number>(0)
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    setTabValue(0)
    setShowChatDrawer(false)
  }, [isSmallScreen])

  const updateRentalUnreadInList = useCallback((rentalId: string) => {
    setRentals(prevRentals =>
      prevRentals.map(rental => {
        if (rental.id === rentalId) {
          return { ...rental, unreadMessages: 0 }
        }
        return rental
      }),
    )
  }, [])

  const reloadRental = useCallback(async () => {
    if (rentalID) {
      setIsLoading(true)
      setCurrentRental(undefined)
      try {
        const retrievedRental = await RentalsService.getRentalById(rentalID)
        setCurrentRental(retrievedRental)
        updateRentalUnreadInList(rentalID)
        setIsLoading(false)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }, [rentalID, showSnackBarWithError, updateRentalUnreadInList])

  useEffect(() => {
    reloadRental()
  }, [rentalID, reloadRental])

  useEffect(() => {
    if (currentRental && userId) {
      setRole(
        currentRental.lenderId === userId
          ? RentalRoleEnum.LENDER
          : RentalRoleEnum.RENTER,
      )
    }
  }, [currentRental, userId])

  useEffect(() => {
    const fetchAllRentals = async () => {
      const retrievedRentals = await RentalsService.getAllRentals()
      setRentals(retrievedRentals)
    }
    fetchAllRentals()
  }, [])

  return (
    <>
      {isSmallScreen ? (
        <>
          <Grid
            container
            sx={{
              overflow: 'clip',
              position: 'absolute',
              top: '100px',
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                position: 'sticky',
                background: 'white',
                top: 100,
                zIndex: 600,
              }}
            >
              <Stack direction="row" spacing={1}>
                <IconButton
                  sx={{ flexShrink: 0, m: 1 }}
                  onClick={() => setShowChatDrawer(val => !val)}
                >
                  {showChatDrawer ? <Close /> : <Chat />}
                </IconButton>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{ flexGrow: 1, width: '100%' }}
                >
                  <Tab label="Chat" sx={{ flexGrow: 1 }} />
                  <Tab label="Rental Progress" sx={{ flexGrow: 1 }} />
                </Tabs>
              </Stack>
              <Divider />
            </Grid>
            <Grid item xs={12} sx={{ height: 'calc(100vh - 160px)' }}>
              {currentRental ? (
                <>
                  {tabValue === 0 && (
                    <>
                      <ChatView
                        rental={currentRental}
                        role={role}
                        isLoadingRental={false}
                      />
                    </>
                  )}
                  {tabValue === 1 && (
                    <RentalStepper
                      role={role}
                      reloadRental={reloadRental}
                      isLoadingRental={false}
                      setCurrentRental={setCurrentRental}
                      rental={currentRental}
                    />
                  )}
                </>
              ) : (
                <Stack sx={{ m: 4 }}>
                  <Button
                    variant="outlined"
                    sx={{ textAlign: 'center' }}
                    onClick={() => setShowChatDrawer(val => !val)}
                  >
                    Select a rental
                  </Button>
                </Stack>
              )}
            </Grid>
          </Grid>
          <Drawer
            hideBackdrop
            ModalProps={{
              sx: { zIndex: 500, overflowY: 'auto' },
            }}
            PaperProps={{
              elevation: 5,
              sx: {
                marginTop: '156px',
                minWidth: '250px',
                height: 'calc(100vh - 160px)',
              },
            }}
            open={showChatDrawer}
            onClose={() => setShowChatDrawer(val => !val)}
          >
            <Divider />
            <DrawerMessageList
              rentals={rentals}
              selectedId={rentalID}
              setShowChatDrawer={setShowChatDrawer}
            />
          </Drawer>
        </>
      ) : (
        <Grid
          container
          sx={{
            overflow: 'hidden',
            position: 'absolute',
            top: 100,
          }}
        >
          <Grid
            item
            xs={3}
            sx={{
              height: 'calc(100vh - 100px)',
              border: 'solid 1px lightgray',
            }}
          >
            <MessageList
              rentals={rentals}
              selectedId={rentalID}
              setOpenChatDrawer={setShowChatDrawer}
            />
          </Grid>
          <Grid
            item
            xs={6}
            sx={{
              height: 'calc(100vh - 100px)',
              border: 'solid 1px lightgray',
            }}
          >
            <ChatView
              rental={currentRental}
              role={role}
              isLoadingRental={false}
            />
          </Grid>
          <Grid
            item
            xs={3}
            sx={{
              height: 'calc(100vh - 100px)',
              border: 'solid 1px lightgray',
            }}
          >
            <RentalStepper
              role={role}
              setCurrentRental={setCurrentRental}
              isLoadingRental={isLoading}
              reloadRental={reloadRental}
              rental={currentRental}
            />
          </Grid>
        </Grid>
      )}
    </>
  )
}
