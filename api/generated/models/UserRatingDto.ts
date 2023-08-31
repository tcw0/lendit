/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RatingDto } from './RatingDto';

export type UserRatingDto = (RatingDto & {
    ratedUserId?: string;
} & {
    ratedUserId: string;
});

