/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaymentDto = {
    id: string;
    rentalAmount: number;
    insuranceAmount: number;
    paymentFromRenter?: string;
    paymentToLender?: string;
};

