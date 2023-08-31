import React, { useEffect } from 'react'

import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'

import { PictureDto } from '@api/models/PictureDto'
import { OpenAPI } from '@api/core/OpenAPI'

type AuthContextType = {
  authToken: string | undefined
  userId: string | undefined
  userName: string | undefined
  userPicture: PictureDto | undefined
  openLogin: boolean
  firstLogin: boolean
  login: (
    authToken: string | undefined,
    userId: string | undefined,
    userName: string | undefined,
    userPicture: PictureDto | undefined,
    firstLogin: boolean,
    rememberMe: boolean,
  ) => void
  logout: () => void
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>
  updateUserPicture: (picture: PictureDto | undefined) => void
  setFirstLogin: React.Dispatch<React.SetStateAction<boolean>>
}

export const AuthContext = React.createContext<AuthContextType>({
  authToken: undefined,
  userId: undefined,
  userName: undefined,
  userPicture: undefined,
  openLogin: false,
  firstLogin: false,
  login: () => {},
  logout: () => {},
  setOpenLogin: () => {},
  updateUserPicture: () => {},
  setFirstLogin: () => {},
})

export function AuthContextProvider(props: { children: React.ReactNode }) {
  const { children } = props

  const [authToken, setAuthToken] = React.useState<string | undefined>(
    undefined,
  )
  const [rememberMe, setRememberMe] = React.useState<boolean>(false)
  const [userId, setUserId] = React.useState<string | undefined>(undefined)
  const [userName, setUserName] = React.useState<string | undefined>(undefined)
  const [userPicture, setUserPicture] = React.useState<PictureDto | undefined>(
    undefined,
  )
  const [firstLogin, setFirstLogin] = React.useState<boolean>(false)

  const [openLogin, setOpenLogin] = React.useState(false)

  useEffect(() => {
    if (
      OpenAPI.HEADERS &&
      (OpenAPI.HEADERS as { 'X-JWT-Token': string })['X-JWT-Token']
    ) {
      Cookies.remove('token')
      Cookies.set(
        'token',
        (OpenAPI.HEADERS as { 'X-JWT-Token': string })['X-JWT-Token'],
        { expires: rememberMe ? 7 : undefined },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OpenAPI.HEADERS, rememberMe])

  useEffect(() => {
    const id = Cookies.get('userId')
    if (id) {
      setUserId(id)
    }
  }, [userId])

  useEffect(() => {
    const name = Cookies.get('userName')
    if (name) {
      setUserName(name)
    }
  }, [userName])

  useEffect(() => {
    const pictureUrl = Cookies.get('userPictureUrl')
    if (pictureUrl) {
      setUserPicture({ url: pictureUrl } as PictureDto)
    }
  }, [userPicture])

  const login = (
    authToken: string | undefined,
    userId: string | undefined,
    userName: string | undefined,
    userPicture: PictureDto | undefined,
    firstLogin: boolean,
    rememberMe: boolean,
  ) => {
    setRememberMe(rememberMe)
    Cookies.set('rememberMe', String(rememberMe), { expires: 7 })
    setAuthToken(authToken)
    setFirstLogin(firstLogin)
    if (authToken) {
      Cookies.set('token', authToken, { expires: rememberMe ? 7 : undefined })
      OpenAPI.HEADERS = {
        'X-JWT-Token': authToken,
      }
    }
    setUserId(userId)
    if (userId) {
      Cookies.set('userId', userId, { expires: rememberMe ? 7 : undefined })
    }
    setUserName(userName)
    if (userName) {
      Cookies.set('userName', userName, { expires: rememberMe ? 7 : undefined })
    }
    setUserPicture(userPicture)
    if (userPicture) {
      Cookies.set('userPictureUrl', userPicture.url, {
        expires: rememberMe ? 7 : undefined,
      })
    }
  }

  const logout = () => {
    setAuthToken(undefined)
    Cookies.remove('token')
    OpenAPI.HEADERS = {
      'X-JWT-Token': '',
    }
    setUserId(undefined)
    Cookies.remove('userId')
    setUserName(undefined)
    Cookies.remove('userName')
    setUserPicture(undefined)
    Cookies.remove('userPictureUrl')
    setRememberMe(false)
    Cookies.remove('rememberMe')
  }

  const updateUserPicture = (picture: PictureDto | undefined) => {
    setUserPicture(picture)
    if (picture) {
      Cookies.set('userPictureUrl', picture.url)
    } else {
      Cookies.remove('userPicture')
    }
  }

  useEffect(() => {
    const token = Cookies.get('token')
    const rememberMe: boolean = JSON.parse(Cookies.get('rememberMe') ?? 'false')
    setRememberMe(rememberMe)

    if (token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decodedToken = jwtDecode<any>(token)
      const expirationTimestamp = decodedToken.expires
      const currentTimestamp = Date.now()
      const gracePeriod = 60 * 60 * 1000 // 1 hour

      if (expirationTimestamp + gracePeriod < currentTimestamp) {
        logout() // Call the logout function to clear the context and cookies
      } else {
        setAuthToken(token)
        OpenAPI.HEADERS = {
          'X-JWT-Token': token,
        }
      }
    }
  }, [])

  const value = React.useMemo(() => {
    return {
      authToken,
      userId,
      userName,
      userPicture,
      openLogin,
      firstLogin,
      login,
      logout,
      setOpenLogin,
      updateUserPicture,
      setFirstLogin,
    }
  }, [authToken, userId, userName, userPicture, openLogin, firstLogin])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
