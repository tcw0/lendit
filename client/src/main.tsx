import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@emotion/react'
import { OpenAPI } from '@api/core/OpenAPI'
import App from './App'
import theme from './Theme'
import { SearchContextProvider } from './context/SearchContextProvider'
import { AuthContextProvider } from './context/AuthContext'
import './index.css'
import { SnackbarContextProvider } from './context/SnackbarContext'
import { ResponsiveContextProvider } from './context/ResponsiveContext'

// Base URL of the API is based on the current hostname of the frontend.
OpenAPI.BASE = `${window.location.protocol}//${window.location.hostname}:8080/api`

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthContextProvider>
      <ResponsiveContextProvider>
        <ThemeProvider theme={theme}>
          <SearchContextProvider>
            <SnackbarContextProvider>
              <BrowserRouter>
                <CssBaseline />
                <App />
              </BrowserRouter>
            </SnackbarContextProvider>
          </SearchContextProvider>
        </ThemeProvider>
      </ResponsiveContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
)
