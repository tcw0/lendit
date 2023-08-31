import { useMediaQuery } from '@mui/material'
import React, { useContext } from 'react'

type ResponsiveContextType = {
  isSmallScreen: boolean
}

export const ResponsiveContext = React.createContext<ResponsiveContextType>({
  isSmallScreen: false,
})

export function ResponsiveContextProvider(props: {
  children: React.ReactNode
}) {
  const { children } = props

  const isSmallScreen = useMediaQuery('(max-width:900px)')

  const value = React.useMemo(() => {
    return {
      isSmallScreen,
    }
  }, [isSmallScreen])

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  )
}

export const useResponsive = () => {
  return useContext(ResponsiveContext)
}
