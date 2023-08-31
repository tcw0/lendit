/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PictureDto } from './PictureDto';

export type RatingDto = {
    id: string;
    stars: number;
    text: string;
    time: string;
    authorId: string;
    authorName: string;
    authorPicture?: PictureDto;
};

