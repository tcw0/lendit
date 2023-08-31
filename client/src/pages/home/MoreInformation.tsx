import * as React from 'react'

// mui components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import { styled } from '@mui/material/styles'

// references
import CloseButton from '../../components/buttons/CloseButton'

const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  align: 'left',
  width: '100%',
  color: theme.palette.primary.main,
}))

const ContentTypography = styled(Typography)(() => ({
  align: 'left',
  width: '100%',
  component: 'div',
  textAlign: 'justify',
}))

export default function MoreInformation({
  openMoreInformation,
  setOpenMoreInformation,
}: {
  openMoreInformation: boolean
  setOpenMoreInformation: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const handleClose = () => {
    setOpenMoreInformation(false)
  }

  return (
    <Dialog maxWidth="sm" open={openMoreInformation} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h4" fontWeight="bold" align="center">
          This is lendit
        </Typography>
        <CloseButton handleClose={handleClose} />
      </DialogTitle>
      <DialogContent dividers>
        <Box gap={1}>
          <HeaderTypography variant="h6">As a lender:</HeaderTypography>
          <ContentTypography variant="body1">
            <Box fontWeight="bold">1. Rent Out Your Items:</Box>
            Share your unused items with your local community, promoting
            sustainability and earning extra income by listing them for rent on
            lendit.
          </ContentTypography>
          <ContentTypography variant="body1">
            <Box fontWeight="bold">2. Provide Item Details:</Box>
            In a step-by-step process you can provide all the necessary details
            about your item, including pictures, a description and the desired
            prices. Specify the item&apos;s availability and the option for
            insurance to make the rental process as convenient as possible.
          </ContentTypography>
          <ContentTypography variant="body1">
            <Box fontWeight="bold">3. Publish and Wait:</Box>
            Once you have completed the item details, publish your listing on
            lendit. Sit back and relax as interested renters reach out to you
            through our platform.
          </ContentTypography>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        <HeaderTypography variant="h6">As a renter:</HeaderTypography>
        <ContentTypography variant="body1">
          <Box fontWeight="bold">1. Discover and Browse:</Box>
          Begin your lending journey by visiting the lendit homepage, where you
          can easily discover and browse through a wide range of recommended
          items across different categories. Explore the possibilities and find
          inspiration for your next project.
        </ContentTypography>
        <ContentTypography variant="body1">
          <Box fontWeight="bold">2. Find the Perfect Item:</Box>
          Utilize our user-friendly search bar to find specific items you are
          looking for. Refine your search with convenient filters such as
          category, price range, availability, and location. This helps you
          narrow down the options and find the perfect item that meets your
          needs.
        </ContentTypography>
        <ContentTypography variant="body1">
          <Box fontWeight="bold">3. Easy Booking Process:</Box>
          Once you have found the desired item, delve into its details to gather
          more information provided by the lender. Take a closer look at photos,
          read descriptions, and check availability. When you are ready, proceed
          with the easy booking process to request to borrow the item.
        </ContentTypography>
        <ContentTypography variant="body1">
          <Box fontWeight="bold">4. Connect with Lenders:</Box>
          Communication is key when borrowing items, and lendit facilitates
          smooth and direct interaction with lenders through our integrated
          messaging system. Ask any questions you may have, negotiate rental
          terms, and coordinate pick-up or delivery details seamlessly. Our
          platform ensures that you can connect with lenders efficiently and
          effectively, enabling a successful borrowing experience.
        </ContentTypography>
        <ContentTypography variant="body1">
          <Box fontWeight="bold">5. Share Your Rental Experience:</Box>
          Your feedback is highly valued within the lendit community. After
          completing your rental, take a moment to share your experience by
          leaving reviews for the lenders and items you have borrowed. Your
          honest feedback helps maintain transparency, builds trust among users,
          and assists future renters in making informed decisions. Together, we
          create a reliable and trustworthy lending ecosystem.
        </ContentTypography>
      </DialogContent>
    </Dialog>
  )
}
