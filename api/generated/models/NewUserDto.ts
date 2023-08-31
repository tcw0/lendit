/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressDto } from './AddressDto';

export type NewUserDto = {
    name: string;
    email: string;
    password: string;
    address: AddressDto;
};

