import React, { useContext } from 'react'

import { Snackbar, Alert, AlertColor } from '@mui/material'

type SnackbarContextType = {
  showSnackBarWithError: (error: unknown) => void
  showSnackBarWithMessage: (message: string, severity: AlertColor) => void
  handleClose: () => void
}

export const SnackbarContext = React.createContext<SnackbarContextType>({
  showSnackBarWithError: () => {},
  showSnackBarWithMessage: () => {},
  handleClose: () => {},
})

export function SnackbarContextProvider(props: { children: React.ReactNode }) {
  const { children } = props

  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState<string>('')
  const [severity, setSeverity] = React.useState<AlertColor>('error')

  const getErrorMessage = (error: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).body && (error as any).body.message) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (error as any).body.message
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    return String(error)
  }

  const showSnackBarWithError = React.useCallback((error: unknown) => {
    setMessage(getErrorMessage(error))
    setSeverity('error')
    setOpen(true)
  }, [])

  const showSnackBarWithMessage = React.useCallback(
    (message: string, severity: AlertColor) => {
      setMessage(message)
      setSeverity(severity)
      setOpen(true)
    },
    [],
  )

  const handleClose = React.useCallback(() => {
    setOpen(false)
    setMessage('')
    setSeverity('error')
  }, [])

  const value = React.useMemo(() => {
    return {
      showSnackBarWithError,
      showSnackBarWithMessage,
      handleClose,
    }
  }, [handleClose, showSnackBarWithError, showSnackBarWithMessage])

  return (
    <SnackbarContext.Provider value={value}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = (): SnackbarContextType => {
  return useContext(SnackbarContext)
}
