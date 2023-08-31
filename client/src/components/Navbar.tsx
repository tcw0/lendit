import React, { useContext, useEffect, useState, MouseEvent } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import { styled } from '@mui/material/styles'

import { useNavigate } from 'react-router-dom'

// icons
import AccountCircle from '@mui/icons-material/AccountCircle'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined'

import {
  Box,
  Button,
  Collapse,
  Container,
  Drawer,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material'
import {
  Chat,
  Close,
  Home,
  Login,
  Logout,
  Person,
  Search,
} from '@mui/icons-material'
import logo from '../assets/LenditLogo.png'

import { AuthContext } from '../context/AuthContext'
import { SearchContext } from '../context/SearchContextProvider'
import LabeledOrPicturedAvatar from './LabeledOrPicturedAvatar'
import { useResponsive } from '../context/ResponsiveContext'

const SearchBar = styled('div')(() => ({
  borderRadius: '16px',
  position: 'relative',
  backgroundColor: 'white',
  width: '90%',
}))

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '50%',
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.secondary.main,
  '&:hover': {
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
  },
  margin: '8px',
  padding: '5px',
  marginRight: '10px',
}))

const InputField = styled(InputBase)(() => ({
  color: 'black',
  outerWidth: '100%',
  flexGrow: '2',
  paddingLeft: '30px',
}))

const LenditNavbarButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
  },
  backgroundColor: theme.palette.secondary.main,
  borderRadius: '5%',
  width: '10rem',
}))

const AddItemButton = styled(Container)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
  },
  backgroundColor: theme.palette.secondary.main,
  borderRadius: '.5rem',
  width: '10rem',
  padding: '0px',
}))

export default function Navbar() {
  const navigate = useNavigate()
  const showAddButtonText = useMediaQuery('(min-width: 1150px)')

  const { finalInput, setFinalInput } = useContext(SearchContext)
  const { authToken, userName, userPicture, logout, setOpenLogin } =
    useContext(AuthContext)
  const { isSmallScreen } = useResponsive()

  const [openDrawer, setOpenDrawer] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [input, setInput] = useState<string>('')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) // State for anchor element of the menu

  // Function to open the menu
  const handleProfileMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (!isSmallScreen) {
      setOpenDrawer(false)
      setOpenSearch(false)
    }
  }, [isSmallScreen])

  useEffect(() => {
    setInput(finalInput)
  }, [finalInput])

  const handleSearch = () => {
    if (input) {
      setFinalInput(input)
      navigate('/items')
      setOpenDrawer(false)
      setOpenSearch(false)
    }
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && input !== '') {
      handleSearch()
    }
  }

  const handleHomeClick = () => {
    navigate('/')
    setOpenDrawer(false)
    setOpenSearch(false)
  }

  const handleMessageClick = () => {
    if (authToken) {
      navigate('/rentals')
    } else {
      setOpenLogin(true)
    }
    setOpenDrawer(false)
    setOpenSearch(false)
  }

  const handleProfileClick = () => {
    if (authToken) {
      navigate('/profile')
    } else {
      setOpenLogin(true)
    }
    setOpenDrawer(false)
    setOpenSearch(false)
    handleProfileMenuClose()
  }

  const handleAddClick = () => {
    if (authToken) {
      navigate('/items/additem')
    } else {
      setOpenLogin(true)
    }
    setOpenDrawer(false)
    setOpenSearch(false)
  }

  const handleLogoutClick = () => {
    logout()
    setOpenDrawer(false)
    setOpenSearch(false)
    navigate('/')
    handleProfileMenuClose()
  }

  const handleLoginClick = () => {
    setOpenLogin(true)
    setOpenDrawer(false)
    setOpenSearch(false)
  }

  const renderAccountButton = () => {
    if (!authToken) {
      return (
        <IconButton
          size="medium"
          onClick={() => setOpenLogin(true)}
          color="inherit"
        >
          <AccountCircle fontSize="large" />
        </IconButton>
      )
    }
    return (
      <>
        <IconButton
          size="medium"
          color="inherit"
          onClick={isSmallScreen ? handleProfileClick : handleProfileMenuClick}
        >
          <LabeledOrPicturedAvatar
            userName={userName || '?'}
            userProfilePicUrl={userPicture?.url}
            variant="circular"
          />
        </IconButton>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </>
    )
  }

  const renderSmallScreenSearch = (): JSX.Element => {
    return (
      <TextField
        sx={{
          width: '100%',
          borderRadius: 20,
        }}
        value={input}
        onChange={handleSearchInput}
        onKeyDown={handleKeyDown}
        InputProps={{
          endAdornment: (
            <CustomIconButton onClick={handleSearch}>
              <SearchIcon />
            </CustomIconButton>
          ),
        }}
        label="Search for an item"
      />
    )
  }

  return (
    <>
      <AppBar position="fixed" enableColorOnDark>
        <Toolbar
          disableGutters
          sx={{
            zIndex: 9999,
            height: '100px',
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
            mx: 1,
          }}
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={3}>
              <Stack
                onClick={handleHomeClick}
                direction="row"
                sx={{ cursor: 'pointer', alignItems: 'center', pl: 1 }}
                spacing={1}
              >
                <Box
                  component="img"
                  sx={{ height: 70, width: 70, mb: 2 }}
                  src={logo}
                />
                {!isSmallScreen && (
                  <Typography color="secondary" variant="h4">
                    lendit
                  </Typography>
                )}
              </Stack>
            </Grid>

            {isSmallScreen ? (
              <Grid item xs={9}>
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <IconButton
                    size="medium"
                    color="inherit"
                    onClick={handleAddClick}
                  >
                    <AddBoxOutlined fontSize="large" />
                  </IconButton>
                  <IconButton
                    size="medium"
                    color="inherit"
                    onClick={() => setOpenSearch(val => !val)}
                  >
                    <Search fontSize="large" />
                  </IconButton>
                  {renderAccountButton()}
                  <IconButton
                    size="medium"
                    color="inherit"
                    onClick={() => setOpenDrawer(val => !val)}
                  >
                    {openDrawer ? (
                      <Close fontSize="large" />
                    ) : (
                      <MenuIcon fontSize="large" />
                    )}
                  </IconButton>
                </Stack>
              </Grid>
            ) : (
              <>
                <Grid item xs={6}>
                  <SearchBar
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mx: '5%',
                    }}
                  >
                    <InputField
                      sx={{ width: '100%' }}
                      value={input}
                      placeholder="What do you want to borrow?"
                      onChange={event => {
                        setInput(event.target.value)
                      }}
                      onKeyDown={handleKeyDown}
                    />
                    <CustomIconButton onClick={handleSearch}>
                      <Search />
                    </CustomIconButton>
                  </SearchBar>
                </Grid>
                <Grid item xs={3}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    flexShrink={2}
                    spacing={1}
                  >
                    <AddItemButton
                      disableGutters
                      sx={{ display: 'flex', alignItems: 'stretch' }}
                    >
                      <IconButton
                        sx={{
                          color: 'inherit',
                          size: 'medium',
                          borderRadius: '0',
                          width: '100%',
                          padding: 0,
                        }}
                        onClick={handleAddClick}
                      >
                        {showAddButtonText && (
                          <Typography
                            sx={{
                              color: 'inherit',
                              variant: 'h6',
                              fontWeight: 'bold',
                              mr: 1,
                            }}
                          >
                            Add Item
                          </Typography>
                        )}
                        <AddBoxOutlined
                          sx={{ color: 'inherit', fontSize: 25 }}
                        />
                      </IconButton>
                    </AddItemButton>

                    {/* right button container */}
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      flexShrink={2}
                    >
                      {/* home button */}
                      <IconButton
                        size="medium"
                        onClick={handleHomeClick}
                        color="inherit"
                      >
                        <Home fontSize="large" />
                      </IconButton>

                      {/* chat button */}
                      <IconButton
                        size="medium"
                        onClick={handleMessageClick}
                        color="inherit"
                        sx={{ paddingTop: 1.5 }}
                      >
                        <Chat fontSize="large" />
                      </IconButton>

                      {/* account button */}
                      {renderAccountButton()}
                    </Stack>
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
      <Collapse
        sx={{ position: 'fixed', width: '100%', zIndex: 700 }}
        in={openSearch}
      >
        <Paper elevation={2} sx={{ width: '100%', p: 2 }}>
          {renderSmallScreenSearch()}
        </Paper>
      </Collapse>
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        ModalProps={{
          sx: { zIndex: 700, overflowY: 'auto' },
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            marginTop: '100px',
            minWidth: '250px',
            height: 'calc(100vh - 100px)',
            p: 1,
            py: 2,
          },
        }}
      >
        {renderSmallScreenSearch()}
        <List sx={{ mx: -1 }}>
          <ListItemButton onClick={handleHomeClick}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton onClick={handleMessageClick}>
            <ListItemIcon>
              <Chat />
            </ListItemIcon>
            <ListItemText primary="Rentals & Messages" />
          </ListItemButton>
          <ListItemButton onClick={handleProfileClick}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
          {authToken ? (
            <ListItemButton onClick={handleLogoutClick}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          ) : (
            <ListItemButton onClick={handleLoginClick}>
              <ListItemIcon>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          )}
        </List>
        <LenditNavbarButton
          sx={{
            width: '100%',
            marginTop: '30px',
          }}
          onClick={handleAddClick}
          startIcon={<AddBoxOutlined />}
        >
          Add Item
        </LenditNavbarButton>
      </Drawer>
    </>
  )
}
