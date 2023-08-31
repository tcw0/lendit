/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressDto } from './AddressDto';
import type { AggregatedRatingDto } from './AggregatedRatingDto';
import type { PictureDto } from './PictureDto';

export type ItemMetaDataDto = {
    id: string;
    title: string;
    avgRating: AggregatedRatingDto;
    priceFirstDay: number;
    pricePerDay: number;
    picture: PictureDto;
    lenderName: string;
    lenderPicture?: PictureDto;
    location: AddressDto;
};

