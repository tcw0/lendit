/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InsuranceTypeEnum } from './InsuranceTypeEnum';
import type { RentalStateEnum } from './RentalStateEnum';

export type RentalDto = {
    id: string;
    start: string;
    end: string;
    price: number;
    insurancePrice: number;
    insuranceType: InsuranceTypeEnum;
    itemId: string;
    renterId: string;
    lenderId: string;
    rentalState: RentalStateEnum;
};

