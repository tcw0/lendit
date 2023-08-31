/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RatingDto } from './RatingDto';

export type ItemRatingDto = (RatingDto & {
    ratedItemId?: string;
} & {
    ratedItemId: string;
});

