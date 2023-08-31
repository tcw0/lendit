import * as React from 'react'
import { Dialog, DialogTitle, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { styled } from '@mui/system'
import TinderCard from 'react-tinder-card'
import CloseButton from 'src/components/buttons/CloseButton'
import AddItem from 'src/pages/additem/AddItem'
import { suggestions } from 'src/assets/upload_suggestions'

const SuggestionCard = styled(TinderCard)(() => ({
  position: 'absolute',
}))

const SwipeButtons = styled(IconButton)(() => ({
  backgroundColor: '#fff',
  boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.3)',
  padding: '16px',
}))

// Memoized SuggestionCard component
const MemoizedSuggestionCard = React.memo(SuggestionCard)

export default function UploadSuggestions() {
  const [indexToAdd, setIndexToAdd] = React.useState<number | undefined>(
    undefined,
  )
  const [currentIndex, setCurrentIndex] = React.useState(suggestions.length - 1)
  const canSwipe = currentIndex >= 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRefs = React.useMemo<React.RefObject<any>[]>(
    () =>
      Array(suggestions.length)
        .fill(0)
        .map(() => React.createRef()),
    [],
  )

  const swiped = React.useCallback(
    (direction: string, index: number) => {
      setCurrentIndex(index - 1)
      if (direction === 'right' && !indexToAdd) {
        setIndexToAdd(index)
      }
    },
    [indexToAdd],
  )

  const outOfFrame = React.useCallback(() => {}, [])

  const swipe = React.useCallback(
    async (direction: string) => {
      if (canSwipe && currentIndex < suggestions.length) {
        await childRefs[currentIndex].current.swipe(direction)
      }
    },
    [canSwipe, currentIndex, childRefs],
  )

  const handleCloseAdd = React.useCallback(() => {
    setIndexToAdd(undefined)
  }, [])

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }} key="Add">
        Add your first item!
      </Typography>
      <Typography variant="h6" fontWeight="bold" key="Have">
        Do you have that?
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '90vw',
          maxWidth: '260px',
          height: '300px',
          mt: 1,
          mb: 4,
        }}
        key="Cards"
      >
        {suggestions.map((suggestion, index) => (
          <MemoizedSuggestionCard
            ref={childRefs[index]}
            key={suggestion.name}
            onSwipe={direction => swiped(direction, index)}
            onCardLeftScreen={outOfFrame}
            preventSwipe={['up', 'down']}
          >
            <Box
              sx={{
                backgroundImage: `url(${suggestion.image})`,
                position: 'relative',
                backgroundColor: '#fff',
                borderRadius: '20px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.1)',
                width: '80vw',
                maxWidth: '260px',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
              }}
              key="Image"
            >
              <Typography
                variant="h5"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  margin: '10px',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
                key="Name"
              >
                {suggestion.name}
              </Typography>
            </Box>
          </MemoizedSuggestionCard>
        ))}
      </Box>
      <Box
        sx={{
          width: '90vw',
          maxWidth: '260px',
          display: 'flex',
          justifyContent: 'space-evenly',
        }}
        key="Buttons"
      >
        <SwipeButtons
          onClick={() => swipe('left')}
          sx={{
            color: '#ec5e6f',
          }}
          key="Close"
        >
          <CloseIcon fontSize="large" />
        </SwipeButtons>
        <SwipeButtons
          onClick={() => swipe('right')}
          sx={{
            color: '#76e2b3',
          }}
          key="Check"
        >
          <CheckIcon fontSize="large" />
        </SwipeButtons>
      </Box>
      <Dialog
        maxWidth="md"
        open={indexToAdd !== undefined}
        onClose={handleCloseAdd}
        PaperProps={{
          sx: {
            width: '900px',
            mx: 0,
          },
        }}
        key="Dialog"
      >
        <DialogTitle>
          <Typography
            component={Typography}
            variant="h5"
            align="center"
            fontWeight="bold"
            key="Title"
          >
            Add item
          </Typography>
          <CloseButton handleClose={handleCloseAdd} />
        </DialogTitle>
        <AddItem
          handleClose={handleCloseAdd}
          suggestion={suggestions[indexToAdd ?? 0]}
          key="Add item"
        />
      </Dialog>
    </>
  )
}
