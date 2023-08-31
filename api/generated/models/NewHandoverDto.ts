/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HandoverTypeEnum } from './HandoverTypeEnum';
import type { PictureDto } from './PictureDto';

export type NewHandoverDto = {
    pictures: Array<PictureDto>;
    comment: string;
    handoverType: HandoverTypeEnum;
};

