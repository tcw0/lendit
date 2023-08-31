import React, { useEffect, useRef } from 'react'
import { Avatar, Box, Stack, Typography, useTheme } from '@mui/material'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'
import logo from 'src/assets/LenditLogo.png'

type ChatBubbleProps = {
  message: string
  isOwnMessage: boolean
  senderName: string
  profilePictureUrl?: string
  isSystemMessage: boolean
  isLastMessage: boolean
  timestamp: string
}
export default function ChatBubble(props: ChatBubbleProps): JSX.Element {
  const {
    message,
    isOwnMessage,
    senderName,
    profilePictureUrl,
    isSystemMessage,
    isLastMessage,
    timestamp,
  } = props
  const theme = useTheme()
  const chatBubbleContainer = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isLastMessage) {
      chatBubbleContainer?.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLastMessage, chatBubbleContainer])

  return (
    <>
      {isSystemMessage ? (
        <Stack>
          <Box
            sx={{
              borderRadius: 3,
              border: `3px solid ${theme.palette.secondary.main}`,
              px: 2,
              py: 0.5,
              mx: 4,
              my: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={logo} variant="square" />
              <Stack>
                <Typography variant="body1" ref={chatBubbleContainer}>
                  {message}
                </Typography>
                <Typography variant="caption" color="gray">
                  {new Date(timestamp).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Stack
          direction={isOwnMessage ? 'row-reverse' : 'row'}
          sx={{ mx: 4, my: 2 }}
          alignItems="top"
          spacing={2}
        >
          <LabeledOrPicturedAvatar
            userName={senderName}
            userProfilePicUrl={profilePictureUrl}
            variant="rounded"
          />
          <Stack sx={{ width: '80%' }}>
            <Box
              sx={{
                borderRadius: 3,
                border: `2px solid ${theme.palette.primary.main}`,
                px: 2,
                py: 0.5,
                bgcolor: isOwnMessage ? theme.palette.primary.main : undefined,
              }}
            >
              <Typography
                color={isOwnMessage ? 'white' : undefined}
                variant="body1"
                ref={chatBubbleContainer}
              >
                {message}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="gray"
              sx={{
                textAlign: isOwnMessage ? 'right' : 'left',
                px: 2,
              }}
            >
              {new Date(timestamp).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      )}
    </>
  )
}

ChatBubble.defaultProps = {
  profilePictureUrl: undefined,
}
