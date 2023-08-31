import React from 'react'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { RentalMetadataDto } from '@api/models/RentalMetadataDto'
import DrawerMessageList from './DrawerMessageList'

type MessageListProps = {
  rentals: RentalMetadataDto[]
  selectedId?: string
  setOpenChatDrawer: (showChatDrawer: boolean) => void
}

export default function MessageList(props: MessageListProps): JSX.Element {
  const { rentals, selectedId, setOpenChatDrawer } = props

  return (
    <Box>
      <Stack
        sx={{
          justifyContent: 'center',
          direction: 'vertical',
          height: '80px',
        }}
      >
        <Typography variant="h5" pl={1}>
          Messages
        </Typography>
        <Typography variant="caption" pl={1}>
          {rentals?.length} Rentals
        </Typography>
      </Stack>
      <Divider />
      <DrawerMessageList
        rentals={rentals}
        selectedId={selectedId}
        setShowChatDrawer={setOpenChatDrawer}
      />
    </Box>
  )
}

MessageList.defaultProps = {
  selectedId: undefined,
}
