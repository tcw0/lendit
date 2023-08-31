/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AggregatedRatingDto } from './AggregatedRatingDto';
import type { PictureDto } from './PictureDto';

export type UserMetaDataDto = {
    id: string;
    name: string;
    picture?: PictureDto;
    avgRating: AggregatedRatingDto;
    registeredSince: string;
};

