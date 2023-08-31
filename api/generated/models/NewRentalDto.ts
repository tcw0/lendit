/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InsuranceTypeEnum } from './InsuranceTypeEnum';

export type NewRentalDto = {
    start: string;
    end: string;
    insuranceType: InsuranceTypeEnum;
    itemId: string;
};

