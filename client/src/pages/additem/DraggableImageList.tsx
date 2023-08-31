import * as React from 'react'
import { Box, IconButton } from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { SnackbarContext } from 'src/context/SnackbarContext'
import { PictureDto } from '@api/models/PictureDto'

const type = 'Image' // Need to pass which type element can be draggable, its a simple string or Symbol. This is like an Unique ID so that the library know what type of element is dragged or dropped on.

function Image({
  image,
  index,
  moveImage,
  removeImage,
}: {
  image: File | PictureDto
  index: number
  moveImage: (dragIndex: number, hoverIndex: number) => void
  removeImage: (index: number) => void
}) {
  const ref = React.useRef(null) // Initialize the reference

  // useDrop hook is responsible for handling whether any item gets hovered or dropped on the element
  const [, drop] = useDrop({
    // Accept will make sure only these element type can be droppable on this element
    accept: type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hover(item: any) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      // current element where the dragged element is hovered on
      const hoverIndex = index
      // If the dragged element is hovered in the same place, then do nothing
      if (dragIndex === hoverIndex) {
        return
      }
      // If it is dragged around other elements, then move the image and set the state with position changes
      moveImage(dragIndex, hoverIndex)
      /*
        Update the index for dragged item directly to avoid flickering
        when the image was half dragged into the next
      */
      // eslint-disable-next-line no-param-reassign
      item.index = hoverIndex
    },
  })

  // useDrag will be responsible for making an element draggable. It also expose, isDragging method to add any styles while dragging
  const [{ isDragging }, drag] = useDrag(() => ({
    // what type of item this to determine if a drop target accepts it
    type,
    // data of the item to be available to the drop methods
    item: { index },
    // method to collect additional data for drop handling like whether is currently being dragged
    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  }))

  /* 
    Initialize drag and drop into the element using its reference.
    Here we initialize both drag and drop on the same element (i.e., Image component)
  */
  drag(drop(ref))

  // Add the reference to the element
  return (
    <Box
      ref={ref}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      key={image instanceof File ? image.name : image.url}
      sx={{
        position: 'relative',
        display: 'inline-block',
        m: '7px',
      }}
    >
      <IconButton
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
          p: '2px',
          m: '4px',
          backgroundColor: 'rgba(200, 200, 200, 0.7)',
          color: 'black',
        }}
        onClick={() => removeImage(index)}
      >
        <ClearIcon sx={{ fontSize: '15px' }} />
      </IconButton>
      <Box
        key={image instanceof File ? image.name : image.url}
        component="img"
        src={image instanceof File ? URL.createObjectURL(image) : image.url}
        alt={`Image ${index + 1}`}
        sx={{
          objectFit: 'cover',
          height: 100,
          width: 100,
          borderRadius: '8px',
          boxShadow: 5,
        }}
      />
    </Box>
  )
}

export default function DraggableImageList({
  images,
  setImages,
}: {
  images: (File | PictureDto)[]
  setImages: React.Dispatch<React.SetStateAction<(File | PictureDto)[]>>
}) {
  const removeImage = (index: number) => {
    setImages(prevImages => {
      const updatedImages = [...prevImages]
      updatedImages.splice(index, 1)
      return updatedImages
    })
  }

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    // Rearrange the images in the state by moving the image at dragIndex to hoverIndex
    const updatedImages = [...images]
    const draggedImage = updatedImages[dragIndex]
    updatedImages.splice(dragIndex, 1)
    updatedImages.splice(hoverIndex, 0, draggedImage)
    setImages(updatedImages)
  }

  // simple way to check whether the device support touch (it doesn't check all fallback, it supports only modern browsers)
  const isTouchDevice = () => {
    if ('ontouchstart' in window) {
      return true
    }
    return false
  }

  const { showSnackBarWithMessage } = React.useContext(SnackbarContext)

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        {images.map((image, index) => (
          <Image
            key={image instanceof File ? image.name : image.url}
            image={image}
            index={index}
            moveImage={moveImage}
            removeImage={removeImage}
          />
        ))}
      </DndProvider>
      <Box
        width={100}
        height={100}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <IconButton component="label" color="secondary">
          <input
            style={{ display: 'none' }}
            accept=".png, .jpg, .jpeg, .gif"
            multiple
            type="file"
            onChange={event => {
              const { files } = event.target
              if (files) {
                const sizeFiles = Array.from(files).filter(
                  file => file.size < 5 * 1024 * 1024,
                )
                if (sizeFiles.length !== files.length) {
                  showSnackBarWithMessage(
                    'Some images are too big (max 5MB)',
                    'warning',
                  )
                }
                setImages(oldArray => [...oldArray, ...sizeFiles])
              }
            }}
          />
          <AddAPhotoIcon sx={{ fontSize: '50px' }} />
        </IconButton>
      </Box>
    </Box>
  )
}
