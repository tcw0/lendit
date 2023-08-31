import { RentalMetadataDto } from '@api/models/RentalMetadataDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { MailOutline } from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useResponsive } from 'src/context/ResponsiveContext'
import lenditLogo from 'src/assets/lenditLogo.png'

type DrawerMessageListProps = {
  rentals: RentalMetadataDto[]
  selectedId?: string
  setShowChatDrawer: (showChatDrawer: boolean) => void
}

export default function DrawerMessageList(
  props: DrawerMessageListProps,
): JSX.Element {
  const { rentals, selectedId, setShowChatDrawer } = props

  const navigate = useNavigate()
  const { isSmallScreen } = useResponsive()

  const navigateToRental = (rentalId: string) => {
    navigate(`/rentals/${rentalId}`)
    setShowChatDrawer(false)
  }

  return (
    <>
      {rentals?.length !== 0 ? (
        <List
          sx={{
            width: '100%',
            overflowY: 'auto',
            height: isSmallScreen
              ? 'calc(100vh - 160px)'
              : 'calc(100vh - 180px)',
            py: 0,
          }}
        >
          {rentals.map(rental => (
            <Box key={rental.id}>
              <ListItem key={rental.id} sx={{ padding: 0 }}>
                <ListItemButton
                  sx={{ padding: 1, py: 2 }}
                  onClick={() => navigateToRental(rental.id)}
                  selected={selectedId === rental.id}
                >
                  <Badge
                    badgeContent={rental.unreadMessages}
                    invisible={rental.unreadMessages === 0}
                    color="secondary"
                  >
                    <Avatar
                      alt={rental.itemName}
                      src={
                        rental.itemPicture?.url
                          ? rental.itemPicture?.url
                          : lenditLogo
                      }
                      sx={{ width: 60, height: 60, borderRadius: 2 }}
                      variant="rounded"
                    />
                  </Badge>
                  <ListItemText
                    sx={{ paddingLeft: 3 }}
                    primary={rental.itemName}
                    primaryTypographyProps={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                    secondary={
                      rental.role === RentalRoleEnum.LENDER
                        ? rental.renterName
                        : rental.lenderName
                    }
                    secondaryTypographyProps={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      ) : (
        <Stack justifyContent="center" alignItems="center" py={2}>
          <MailOutline />
          <Typography variant="caption">No Rentals.</Typography>
          <Button
            sx={{ mt: 5 }}
            variant="outlined"
            onClick={() => navigate('/items')}
          >
            <Typography variant="body1">Browse Items</Typography>
          </Button>
        </Stack>
      )}
    </>
  )
}

DrawerMessageList.defaultProps = {
  selectedId: undefined,
}
