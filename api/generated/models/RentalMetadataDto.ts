/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PictureDto } from './PictureDto';
import type { RentalRoleEnum } from './RentalRoleEnum';

export type RentalMetadataDto = {
    id: string;
    itemName: string;
    renterName: string;
    lenderName: string;
    unreadMessages: number;
    itemPicture: PictureDto;
    role?: RentalRoleEnum;
};

