import { ChatMessageDto } from '@api/models/ChatMessageDto'
import { Send } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from 'react'
import { RentalDto } from '@api/models/RentalDto'
import { RentalsService } from '@api/services/RentalsService'
import { NewChatMessageDto } from '@api/models/NewChatMessageDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { UserMetaDataDto } from '@api/models/UserMetaDataDto'
import { AuthContext } from 'src/context/AuthContext'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'
import { useSnackbar } from 'src/context/SnackbarContext'
import { useResponsive } from 'src/context/ResponsiveContext'
import ChatBubble from './ChatBubble'

type ChatViewProps = {
  rental: RentalDto | undefined
  role: RentalRoleEnum
  isLoadingRental: boolean
}

export default function ChatView(props: ChatViewProps): JSX.Element {
  const { rental, role, isLoadingRental } = props
  const { userId, userName, userPicture } = useContext(AuthContext)
  const { showSnackBarWithError } = useSnackbar()
  const { isSmallScreen } = useResponsive()

  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [message, setMessage] = useState('')

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
  const [otherChatter, setOtherChatter] = useState<UserMetaDataDto | undefined>(
    undefined,
  )

  useEffect(() => {
    const fetchOtherChatter = async () => {
      if (rental) {
        try {
          if (role === RentalRoleEnum.LENDER) {
            const otherChatter = await RentalsService.getRentalRenter(rental.id)
            setOtherChatter(otherChatter)
          } else if (role === RentalRoleEnum.RENTER) {
            const otherChatter = await RentalsService.getRentalLender(rental.id)
            setOtherChatter(otherChatter)
          }
        } catch (error) {
          showSnackBarWithError(error)
        }
      }
    }
    fetchOtherChatter()
  }, [rental, role, showSnackBarWithError])

  const reloadMessages = async () => {
    if (rental) {
      const messages = await RentalsService.getAllMessagesForRental(rental?.id)
      setMessages(messages)
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (rental) {
        try {
          setIsLoadingMessages(true)
          const messages = await RentalsService.getAllMessagesForRental(
            rental?.id,
          )
          setMessages(messages)
        } catch (error) {
          showSnackBarWithError(error)
        } finally {
          setIsLoadingMessages(false)
        }
      }
    }
    fetchMessages()
  }, [rental, showSnackBarWithError])

  const onSend = async () => {
    try {
      if (rental && message) {
        await RentalsService.createMessage(rental.id, {
          text: message,
        } as NewChatMessageDto)
        setMessage(oldMessage => oldMessage.replace(/[\r\n]+/g, ''))
        setMessage('')
        const messages = await RentalsService.getAllMessagesForRental(
          rental?.id,
        )
        setMessages(messages)
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      onSend()
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }

  const getChatterInfo = (): JSX.Element => {
    if (otherChatter) {
      return (
        <>
          <LabeledOrPicturedAvatar
            userName={otherChatter?.name || '?'}
            userProfilePicUrl={otherChatter?.picture?.url}
            variant="rounded"
            sx={{ height: 50, width: 50, ml: 2 }}
          />
          <Stack>
            <Typography variant="h5">{otherChatter?.name}</Typography>
            <Typography variant="caption">
              You are the {role === RentalRoleEnum.RENTER ? 'renter' : 'lender'}
              .
            </Typography>
          </Stack>
        </>
      )
    }
    return (
      <>
        <Skeleton variant="rounded" width={50} height={50} sx={{ ml: 2 }} />
        <Skeleton variant="text" height={40} width={200} sx={{ mr: 2 }} />
      </>
    )
  }

  return (
    <Box sx={{ position: 'relative' }} onClick={reloadMessages}>
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '80px',
          position: 'sticky',
          background: 'white',
          top: isSmallScreen ? 150 : 0,
          zIndex: 1,
          borderBottom: '1px solid lightgrey',
        }}
        spacing={1}
      >
        {rental && getChatterInfo()}
      </Stack>
      <Box
        sx={{
          p: 1,
          overflowY: 'auto',
          height: isSmallScreen ? 'calc(100vh - 240px)' : 'calc(100vh - 180px)',
        }}
      >
        {isLoadingMessages || isLoadingRental ? (
          <CircularProgress
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
            }}
          />
        ) : (
          <>
            {messages?.map((message, index) => (
              <ChatBubble
                key={message.id}
                message={message.text}
                isOwnMessage={message.authorId === userId}
                senderName={
                  message.authorId === userId
                    ? userName || '?'
                    : otherChatter?.name || '?'
                }
                profilePictureUrl={
                  message.authorId === userId
                    ? userPicture?.url
                    : otherChatter?.picture?.url
                }
                isSystemMessage={message.isSystemMessage}
                isLastMessage={index === messages.length - 1}
                timestamp={message.time}
              />
            ))}
          </>
        )}
        <Box sx={{ mb: 8 }} />
      </Box>
      <TextField
        sx={{
          position: isSmallScreen ? 'sticky' : 'absolute',
          bottom: 10,
          marginLeft: '10%',
          marginRight: '10%',
          width: '80%',
          backgroundColor: 'white',
        }}
        disabled={!rental}
        multiline
        value={message}
        maxRows={2}
        label="Send Message"
        size="small"
        onKeyDown={handleKeyPress}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <Send
              sx={
                rental && {
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    cursor: 'pointer',
                    transform: 'scale(1.1)',
                  },
                }
              }
              onClick={rental ? onSend : undefined}
            />
          ),
        }}
      />
    </Box>
  )
}
