import { Box, Typography, Stack, Divider } from '@mui/material'
import React from 'react'

import Footer from 'src/components/Footer'

export default function About() {
  return (
    <>
      <Stack
        spacing={1.5}
        direction="column"
        sx={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}
      >
        <Typography variant="h5" fontWeight="bold">
          About
        </Typography>
        <Typography variant="body1">
          Company Name: Lendit
          <br /> Email: info@lendit.com
          <br />
          Website: lendit.com
        </Typography>
        <Divider />
        <Typography variant="h5" fontWeight="bold">
          Disclaimer
        </Typography>
        <Typography variant="body1">
          The content of our website has been compiled with meticulous care and
          to the best of our knowledge. However, we cannot assume any liability
          for the up-to-dateness, completeness, or accuracy of the information
          provided. As a service provider, we are responsible for our own
          content on these pages under the general laws. However, we are not
          obligated to monitor transmitted or stored third-party information or
          to investigate circumstances that indicate illegal activity.
          Obligations to remove or block the use of information under general
          law remain unaffected. However, liability in this regard is only
          possible from the time of knowledge of a concrete infringement. Upon
          becoming aware of such violations, we will remove this content
          immediately.
        </Typography>
        <Divider />
        <Typography variant="h5" fontWeight="bold">
          Copyright
        </Typography>
        <Typography variant="body1">
          The content and works on these pages created by the site operators are
          subject to copyright law. The reproduction, editing, distribution, and
          any kind of use outside the limits of copyright law require the
          written consent of the respective author or creator. Downloads and
          copies of this site are only permitted for private, non-commercial
          use. Insofar as the content on this site was not created by the
          operator, the copyrights of third parties are respected. In
          particular, third-party content is identified as such. Should you
          nevertheless become aware of a copyright infringement, please inform
          us accordingly. Upon becoming aware of any infringements, we will
          remove such content immediately.
        </Typography>
        <Divider />
        <Typography variant="h5" fontWeight="bold">
          Data Protection
        </Typography>
        <Typography variant="body1">
          We take the protection of your personal data very seriously. We treat
          your personal data confidentially and in accordance with the legal
          data protection regulations and this privacy policy. Please note that
          data transmission over the Internet (e.g., communication by email) may
          have security vulnerabilities. A complete protection of data against
          access by third parties is not possible.
        </Typography>
      </Stack>
      <Box mt={2} />
      <Footer />
    </>
  )
}
