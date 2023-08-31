import { Avatar, SxProps, Theme } from '@mui/material'
import React, { MouseEventHandler } from 'react'

type LabeledOrPicturedAvatarProps = {
  userName: string
  userProfilePicUrl?: string
  variant: 'circular' | 'rounded' | 'square'
  sx?: SxProps<Theme>
  onClick?: MouseEventHandler<HTMLDivElement>
}

export default function LabeledOrPicturedAvatar(
  props: LabeledOrPicturedAvatarProps,
): JSX.Element {
  const { userName, userProfilePicUrl, variant, sx, onClick } = props

  return (
    <>
      {userProfilePicUrl ? (
        <Avatar
          onClick={onClick}
          sx={sx}
          alt={userName}
          src={userProfilePicUrl}
          variant={variant}
        />
      ) : (
        <Avatar variant={variant} sx={sx} onClick={onClick}>
          {`${userName?.split(' ')[0][0]}${userName?.split(' ')[1]?.[0] || ''}`}
        </Avatar>
      )}
    </>
  )
}

LabeledOrPicturedAvatar.defaultProps = {
  userProfilePicUrl: undefined,
  sx: [],
  onClick: undefined,
}
