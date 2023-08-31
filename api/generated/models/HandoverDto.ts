/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HandoverTypeEnum } from './HandoverTypeEnum';
import type { PictureDto } from './PictureDto';

export type HandoverDto = {
    id: string;
    pictures: Array<PictureDto>;
    comment: string;
    agreedRenter?: string;
    agreedLender?: string;
    handoverType: HandoverTypeEnum;
};

