import { HandoverDto } from '@api/models/HandoverDto'
import { HandoverTypeEnum } from '@api/models/HandoverTypeEnum'
import { RentalDto } from '@api/models/RentalDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { RentalsService } from '@api/services/RentalsService'
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  StepContent,
  StepLabel,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import {
  AddAPhoto,
  CheckCircle,
  Clear,
  KeyboardArrowRight,
} from '@mui/icons-material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PictureDto } from '@api/models/PictureDto'
import { NewHandoverDto } from '@api/models/NewHandoverDto'
import { useSnackbar } from 'src/context/SnackbarContext'
import { UsersService } from '@api/services/UsersService'
import PictureModal from './PictureModal'

type HandoverStepProps = {
  rental?: RentalDto
  reloadRental: () => void
  role: RentalRoleEnum
  handoverType: HandoverTypeEnum
}

export default function HandoverStep(props: HandoverStepProps): JSX.Element {
  const theme = useTheme()
  const { rental, role, handoverType, reloadRental } = props
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [editMode, setEditMode] = useState<boolean>(true)

  const [openPictureModal, setOpenPictureModal] = useState<boolean>(false)
  const [pictureModalSrc, setPictureModalSrc] = useState<string>('')

  const [handover, setHandover] = useState<HandoverDto | undefined>(undefined)
  const [handoverPictures, setHandoverPictures] = useState<File[]>([])
  const [handoverPictureUrls, setHandoverPictureUrls] = useState<string[]>([])
  const [handoverComment, setHandoverComment] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null)

  const handleClosePictureModal = () => {
    setOpenPictureModal(false)
    setPictureModalSrc('')
  }

  const viewPicture = (pictureUrl: string) => {
    setPictureModalSrc(pictureUrl)
    setOpenPictureModal(true)
  }

  const roleHasAgreed = useCallback((): boolean => {
    return Boolean(
      (role === RentalRoleEnum.RENTER && handover?.agreedRenter) ||
        (role === RentalRoleEnum.LENDER && handover?.agreedLender),
    )
  }, [role, handover])

  useEffect(() => {
    setEditMode(!handover)
  }, [handover])

  useEffect(() => {
    const fetchHandover = async () => {
      if (rental) {
        setIsLoading(true)
        try {
          const handover = await RentalsService.getHandover(
            rental.id,
            handoverType,
          )
          setHandover(handover)
          setHandoverPictureUrls(
            handover ? handover.pictures.map(p => p.url) : [],
          )
          setHandoverComment(handover?.comment || '')
        } catch (error) {
          showSnackBarWithError(error)
          setEditMode(true)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchHandover()
  }, [handoverType, rental, showSnackBarWithError])

  const onFileChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { files } = event.currentTarget
    if (files) {
      const sizeValidatedFiles = Array.from(files).filter(
        file => file.size < 5 * 1024 * 1024,
      )

      if (sizeValidatedFiles.length !== files.length) {
        showSnackBarWithMessage('Some images are too big (max 5MB)', 'warning')
      }

      const fileUrls = sizeValidatedFiles.map(file => URL.createObjectURL(file))

      setHandoverPictureUrls(oldHandoverPicUrls => [
        ...oldHandoverPicUrls,
        ...fileUrls,
      ])
      setHandoverPictures(oldHandoverPics => [
        ...oldHandoverPics,
        ...sizeValidatedFiles,
      ])
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      inputRef.current!.value = ''
    }
  }

  const onSubmitHandover = async () => {
    if (rental) {
      try {
        const handoverPictureUploaded: PictureDto[] =
          await UsersService.uploadPicture({
            files: handoverPictures,
          })
        const newHandover = {
          pictures: handoverPictureUploaded,
          handoverType,
          comment: handoverComment,
        } as NewHandoverDto
        await RentalsService.createHandover(rental?.id, newHandover)
        reloadRental()
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }

  const onReject = async () => {
    if (rental) {
      await RentalsService.declineHandover(rental?.id, handoverType)
      setHandover(undefined)
      reloadRental()
    }
  }

  const onAccept = async () => {
    if (rental) {
      await RentalsService.acceptHandover(rental?.id, handoverType)
      reloadRental()
    }
  }

  const removeImage = (index: number) => {
    setHandoverPictureUrls(prevImageUrls => {
      const updatedImageUrls = [...prevImageUrls]
      updatedImageUrls.splice(index, 1)
      return updatedImageUrls
    })
    setHandoverPictures(prevImages => {
      const updatedImages = [...prevImages]
      updatedImages.splice(index, 1)
      return updatedImages
    })
  }

  return (
    <>
      <StepLabel>
        <Typography fontWeight={600} variant="subtitle1">
          {handoverType === HandoverTypeEnum.PICKUP ? 'Pickup' : 'Return'}
        </Typography>
      </StepLabel>
      <StepContent>
        <Stack direction="column" spacing={1}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: '100%', overflowX: 'auto' }}
            p="5px"
          >
            {isLoading ? (
              <Skeleton
                variant="rounded"
                sx={{
                  width: '100px',
                  height: '100px',
                }}
              />
            ) : (
              <>
                {handoverPictureUrls.map((picUrl, index) => (
                  <Box
                    key={picUrl}
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    {editMode && (
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
                          cursor: 'pointer',
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <Clear sx={{ fontSize: '15px' }} />
                      </IconButton>
                    )}
                    <Box
                      component="img"
                      src={picUrl}
                      alt={`Image ${index + 1}`}
                      sx={{
                        objectFit: 'cover',
                        height: 100,
                        width: 100,
                        borderRadius: '8px',
                        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer',
                      }}
                      onClick={() => viewPicture(picUrl)}
                    />
                  </Box>
                ))}
                {editMode && (
                  <Box
                    sx={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '10px',
                      border: `5px solid ${theme.palette.secondary.main}}`,
                    }}
                  >
                    <IconButton
                      component="label"
                      color="secondary"
                      sx={{
                        p: '15px',
                      }}
                    >
                      <input
                        style={{ display: 'none' }}
                        accept=".png, .jpg, .jpeg, .gif"
                        multiple
                        type="file"
                        onChange={onFileChange}
                        ref={inputRef}
                      />
                      <AddAPhoto sx={{ fontSize: '50px' }} />
                    </IconButton>
                  </Box>
                )}
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={1} pt={1}>
            <TextField
              size="small"
              disabled={!editMode}
              multiline
              label="Comment"
              rows={2}
              value={handoverComment}
              onChange={event => setHandoverComment(event.target.value)}
              sx={{
                width: '100%',
              }}
            />
            {editMode && (
              <Button
                variant="contained"
                onClick={onSubmitHandover}
                disabled={!handoverComment || handoverPictureUrls.length === 0}
              >
                <KeyboardArrowRight />
              </Button>
            )}
          </Stack>
          {!editMode && !roleHasAgreed() && (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onAccept} color="secondary">
                Accept
              </Button>
              <Button variant="contained" onClick={onReject} color="error">
                Reject
              </Button>
            </Stack>
          )}
        </Stack>
        {handover?.agreedLender && (
          <Tooltip title={new Date(handover.agreedLender).toLocaleString()}>
            <Stack direction="row" spacing={1} pt={1}>
              <CheckCircle />
              <Typography variant="body2">
                The lender agreed to this handover.
              </Typography>
            </Stack>
          </Tooltip>
        )}
        {handover?.agreedRenter && (
          <Tooltip title={new Date(handover.agreedRenter).toLocaleString()}>
            <Stack direction="row" spacing={1} pt={1}>
              <CheckCircle />
              <Typography variant="body2">
                The renter agreed to this handover.
              </Typography>
            </Stack>
          </Tooltip>
        )}
      </StepContent>
      <PictureModal
        open={openPictureModal}
        handleClose={handleClosePictureModal}
        pictureUrl={pictureModalSrc}
      />
    </>
  )
}

HandoverStep.defaultProps = {
  rental: undefined,
}
