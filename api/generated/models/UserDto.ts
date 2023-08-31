/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressDto } from './AddressDto';
import type { AggregatedRatingDto } from './AggregatedRatingDto';
import type { PictureDto } from './PictureDto';

export type UserDto = {
    id: string;
    name: string;
    email: string;
    description?: string;
    picture?: PictureDto;
    registeredSince: string;
    avgRating: AggregatedRatingDto;
    address: AddressDto;
};

