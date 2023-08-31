import React from 'react'
import { ItemDto } from '@api/models/ItemDto'
import { Dialog, DialogTitle } from '@mui/material'
import CloseButton from 'src/components/buttons/CloseButton'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
// import lenditLogo from '../../assets/lenditLogo.png'

type ImageListProps = {
  item: ItemDto
  showAllPictures: boolean
  setShowAllPictures: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ShowImageList({
  item,
  showAllPictures,
  setShowAllPictures,
}: ImageListProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={showAllPictures}
      onClose={() => {
        setShowAllPictures(false)
      }}
    >
      <DialogTitle>
        <CloseButton
          handleClose={() => {
            setShowAllPictures(false)
          }}
        />
      </DialogTitle>
      <ImageList sx={{ width: '95%', m: '2rem' }} variant="woven" cols={2}>
        {item.pictures.map(picture => (
          <ImageListItem sx={{ p: '.5rem' }} key={picture.url}>
            <img src={picture.url} alt="item" />
          </ImageListItem>
        ))}
      </ImageList>
    </Dialog>
  )
}
