import { NewFeaturedDto } from '@api/models/NewFeaturedDto'
import { ItemsService } from '@api/services/ItemsService'
import {
  Backdrop,
  Box,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  Grid,
  Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { useSnackbar } from 'src/context/SnackbarContext'
import { PaymentMethodDto } from '@api/models/PaymentMethodDto'
import { ItemDto } from '@api/models/ItemDto'
import GreenButtonBase from 'src/components/buttons/GreenButtonBase'
import { UsersService } from '@api/services/UsersService'
import { AuthContext } from 'src/context/AuthContext'
import { stripeRentalPaymentMethodHandler } from 'src/components/Checkout'
import { PaymentDto } from '@api/models/PaymentDto'
import PaymentTab from '../profile/profiletabs/paymentTab/PaymentTab'

type FeaturedBookingProps = {
  itemId: string
}

export default function FeaturedBooking(
  props: FeaturedBookingProps,
): JSX.Element {
  const { itemId } = props
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()
  const [paymentId, setPaymentId] = React.useState<string | undefined>(
    undefined,
  )
  const [days, setDays] = React.useState<number | undefined>(undefined)
  const [price, setPrice] = React.useState<number | undefined>(undefined)
  const [openPayDialog, setOpenPayDialog] = React.useState(false)
  const [currentItem, setCurrentItem] = React.useState<ItemDto | undefined>(
    undefined,
  )
  const { userId } = React.useContext(AuthContext)
  const closePayDialog = (): void => {
    setOpenPayDialog(false)
    setDays(undefined)
    setPaymentId(undefined)
  }
  const [isPaymentProcessing, setIsPaymentProcessing] = React.useState(false)

  const handlePay = (payment: PaymentMethodDto): void => {
    setPaymentId(payment.id)
  }

  const handleBuyFeaturedButton = (days: number): void => {
    setDays(days)
    setOpenPayDialog(true)
    switch (days) {
      case 7:
        setPrice(199)
        break
      case 30:
        setPrice(499)
        break
      case 90:
        setPrice(999)
        break
      case 365:
        setPrice(2599)
        break
      default:
        break
    }
  }

  useEffect(() => {
    // Only run if both paymentId and days are set
    const buyFeatured = async (days: number, paymentId: string) => {
      const newFeatured: NewFeaturedDto = {
        durationInDays: days,
        paymentId,
      }

      try {
        setIsPaymentProcessing(true)
        const payments = await UsersService.getUserPaymentMethods(userId || '')
        let paymentMethod: PaymentMethodDto | undefined
        if (payments) {
          paymentMethod = payments.find(payment => payment.id === paymentId)
        }

        if (paymentMethod === undefined) {
          showSnackBarWithError('Payment not found')
          return
        }

        const paymentTest: PaymentDto = {
          id: paymentMethod?.id || '',
          rentalAmount: price || 0,
          insuranceAmount: 0,
        }

        await stripeRentalPaymentMethodHandler(
          paymentMethod?.stripeId,
          paymentTest,
          userId || '',
          true,
        )

        const item: ItemDto = await ItemsService.addFeaturedItem(
          itemId,
          newFeatured,
        )
        setIsPaymentProcessing(false)
        setCurrentItem(item)
        if (!item.featuredUntil) {
          showSnackBarWithMessage(`Something went wrong! Try again.`, 'error')
        } else {
          showSnackBarWithMessage(
            `The item will be featured until ${new Date(
              item.featuredUntil,
            ).toLocaleDateString(undefined, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}!`,
            'success',
          )
        }
      } catch (error) {
        showSnackBarWithError(error)
      } finally {
        closePayDialog()
      }
    }
    if (paymentId !== undefined && days !== undefined) {
      buyFeatured(days, paymentId)
    }
  }, [
    paymentId,
    days,
    itemId,
    price,
    showSnackBarWithError,
    showSnackBarWithMessage,
    userId,
  ])

  useEffect(() => {
    const fetchItem = async () => {
      const retrievedItem = await ItemsService.getItemById(itemId)
      setCurrentItem(retrievedItem)
    }

    fetchItem()
  }, [itemId])

  const onSubmitClick = async () => {
    setIsPaymentProcessing(true)
    // eslint-disable-next-line
    await new Promise(resolve => setTimeout(resolve, 5000))
    try {
      const payments = await UsersService.getUserPaymentMethods(userId || '')

      const newFeatured: NewFeaturedDto = {
        durationInDays: days || 0,
        paymentId: payments[0].id || '',
      }
      const item: ItemDto = await ItemsService.addFeaturedItem(
        itemId,
        newFeatured,
      )
      setIsPaymentProcessing(false)
      setCurrentItem(item)
      if (!item.featuredUntil) {
        showSnackBarWithMessage(`Something went wrong! Try again.`, 'error')
      } else {
        showSnackBarWithMessage(
          `The item will be featured until ${new Date(
            item.featuredUntil,
          ).toLocaleDateString()}!`,
          'success',
        )
      }
    } catch (error) {
      showSnackBarWithError(error)
    } finally {
      setIsPaymentProcessing(false)
      closePayDialog()
    }
  }

  return (
    <>
      <Typography variant="h6" fontWeight="bold">
        Make your item more visible by featuring it!
      </Typography>
      <Typography variant="body2" mb={1}>
        {currentItem?.featuredUntil &&
        new Date(currentItem.featuredUntil) > new Date() ? (
          <>
            Your item is featured until{' '}
            <strong>
              {new Date(currentItem.featuredUntil).toLocaleDateString(
                undefined,
                { day: '2-digit', month: '2-digit', year: 'numeric' },
              )}
            </strong>
            ! Choose duration to extend the featured period.
          </>
        ) : (
          'Choose the duration of the feature and pay with your credit card.'
        )}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxShadow: 10,
            }}
          >
            <CardContent>
              <Typography variant="body1" fontWeight="bold">
                7 days
              </Typography>
              <Typography variant="body2">
                Try boosting your item to the top of the search results and to
                the start page for 7 days.
              </Typography>
            </CardContent>
            <CardActions sx={{ marginTop: 'auto' }}>
              <GreenButtonBase onClick={() => handleBuyFeaturedButton(7)}>
                Buy for EUR 1.99
              </GreenButtonBase>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxShadow: 10,
            }}
          >
            <CardContent>
              <Typography variant="body1" fontWeight="bold">
                30 days
              </Typography>
              <Typography variant="body2">
                Boost your item to the top of the search results and to the
                start page for 30 days.
              </Typography>
            </CardContent>
            <CardActions sx={{ marginTop: 'auto' }}>
              <GreenButtonBase onClick={() => handleBuyFeaturedButton(30)}>
                Buy for EUR 4.99
              </GreenButtonBase>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxShadow: 10,
            }}
          >
            <CardContent>
              <Typography variant="body1" fontWeight="bold">
                90 days
              </Typography>
              <Typography variant="body2">
                Boost your item to the top of the search results and to the
                start page for 90 days.
              </Typography>
            </CardContent>
            <CardActions sx={{ marginTop: 'auto' }}>
              <GreenButtonBase onClick={() => handleBuyFeaturedButton(90)}>
                Buy for EUR 9.99
              </GreenButtonBase>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxShadow: 10,
            }}
          >
            <CardContent>
              <Typography variant="body1" fontWeight="bold">
                {' '}
                365 days
              </Typography>
              <Typography variant="body2">
                Boost your item to the top of the search results and to the
                start page for a whole year (365 days) - best value!
              </Typography>
            </CardContent>
            <CardActions sx={{ marginTop: 'auto' }}>
              <GreenButtonBase onClick={() => handleBuyFeaturedButton(365)}>
                Buy for EUR 25.99
              </GreenButtonBase>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={openPayDialog} onClose={closePayDialog}>
        <PaymentTab
          handlePaymentMethodClick={handlePay}
          payment={{
            id: '',
            rentalAmount: price || 499,
            insuranceAmount: 0,
          }}
          onSubmitClickProp={onSubmitClick}
          handleClose={closePayDialog}
        />

        <Backdrop
          open={isPaymentProcessing}
          sx={{ color: '#fff', zIndex: 9999 }}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <CircularProgress />
            <Typography
              variant="h6"
              component="div"
              style={{ marginTop: '20px' }}
            >
              Processing payment via Stripe, please wait...
            </Typography>
          </Box>
        </Backdrop>
      </Dialog>
    </>
  )
}
