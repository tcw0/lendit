/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AvailabilityDto } from './AvailabilityDto';
import type { CategoryEnum } from './CategoryEnum';
import type { PictureDto } from './PictureDto';

export type NewItemDto = {
    title: string;
    description: string;
    priceFirstDay: number;
    pricePerDay: number;
    availability: AvailabilityDto;
    pictures: Array<PictureDto>;
    insuranceReq: boolean;
    categories: Array<CategoryEnum>;
    addressId?: string;
};

