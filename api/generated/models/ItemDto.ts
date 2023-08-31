/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressDto } from './AddressDto';
import type { AggregatedRatingDto } from './AggregatedRatingDto';
import type { AvailabilityDto } from './AvailabilityDto';
import type { CategoryEnum } from './CategoryEnum';
import type { PictureDto } from './PictureDto';

export type ItemDto = {
    id: string;
    title: string;
    description: string;
    priceFirstDay: number;
    pricePerDay: number;
    availability: AvailabilityDto;
    pictures: Array<PictureDto>;
    avgRating: AggregatedRatingDto;
    insuranceReq: boolean;
    categories: Array<CategoryEnum>;
    lenderId: string;
    address?: AddressDto;
    featuredUntil?: string;
};

