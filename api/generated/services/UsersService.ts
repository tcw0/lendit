/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressDto } from '../models/AddressDto';
import type { ItemMetaDataDto } from '../models/ItemMetaDataDto';
import type { NewPaymentMethodDto } from '../models/NewPaymentMethodDto';
import type { NewUserDto } from '../models/NewUserDto';
import type { PaymentDto } from '../models/PaymentDto';
import type { PaymentMethodDto } from '../models/PaymentMethodDto';
import type { PictureDto } from '../models/PictureDto';
import type { UserDto } from '../models/UserDto';
import type { UserMetaDataDto } from '../models/UserMetaDataDto';
import type { UserRatingDto } from '../models/UserRatingDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Create Payment Intent
     * Creates a payment intent and interacts with Stripe's API
     * @param userId
     * @param paymentMethodId
     * @param requestBody
     * @returns any Successful response
     * @throws ApiError
     */
    public static createStripePayment(
        userId: string,
        paymentMethodId: string,
        requestBody: {
            payment?: PaymentDto;
            savePaymentMethod?: boolean;
            rentalID?: string;
        },
    ): CancelablePromise<{
        error?: string;
        clientSecret?: string;
        requiresAction?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userID}/create-payment-intent/{paymentMethodID}',
            path: {
                'userID': userId,
                'paymentMethodID': paymentMethodId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Upload a file
     * @param formData
     * @returns PictureDto File uploaded successfully
     * @throws ApiError
     */
    public static uploadPicture(
        formData?: {
            files?: Array<Blob>;
        },
    ): CancelablePromise<Array<PictureDto>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/pictureUpload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid file format or missing file`,
                500: `Failed to upload file`,
            },
        });
    }

    /**
     * Create new user
     * Create new user
     * @param requestBody Create user object
     * @returns any successful operation
     * @throws ApiError
     */
    public static createUser(
        requestBody?: NewUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Logs user into the system
     * Logs user into the system by email & password
     * @param requestBody
     * @returns any successful operation
     * @throws ApiError
     */
    public static loginUser(
        requestBody?: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        user: UserMetaDataDto;
        token: string;
        firstLogin?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email/password supplied`,
            },
        });
    }

    /**
     * Change password of user
     * Change password of user
     * @param userId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static changePassword(
        userId: string,
        requestBody?: {
            oldPassword: string;
            newPassword: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userID}/changepassword',
            path: {
                'userID': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user ID supplied`,
                401: `Unauthorized`,
                404: `User not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Verify user by verification ID
     * Verify user by verification ID
     * @param userId
     * @param verificationId
     * @returns any successful operation
     * @throws ApiError
     */
    public static verifyUser(
        userId: string,
        verificationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userID}/verify/{verificationID}',
            path: {
                'userID': userId,
                'verificationID': verificationId,
            },
            errors: {
                400: `Invalid verification ID supplied`,
            },
        });
    }

    /**
     * Get user by user ID
     * Get user by user ID
     * @param userId
     * @returns UserDto successful operation
     * @throws ApiError
     */
    public static getUserById(
        userId: string,
    ): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userID}',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Update user by ID
     * Update user by ID of the logged in user
     * @param userId
     * @param requestBody
     * @returns UserDto Successful operation
     * @throws ApiError
     */
    public static updateUserById(
        userId: string,
        requestBody?: UserDto,
    ): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{userID}',
            path: {
                'userID': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Delete user by ID
     * Delete user by ID of the logged in user
     * @param userId
     * @returns any successful operation
     * @throws ApiError
     */
    public static deleteUserById(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{userID}',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Get user all addresses by user ID
     * Get all user addresses by user ID
     * @param userId
     * @returns AddressDto successful operation
     * @throws ApiError
     */
    public static getUserAddressesById(
        userId: string,
    ): CancelablePromise<Array<AddressDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userID}/address',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Create new address for user
     * Create new address for user
     * @param userId
     * @param requestBody Create address object
     * @returns AddressDto successful operation
     * @throws ApiError
     */
    public static createUserAddress(
        userId: string,
        requestBody?: AddressDto,
    ): CancelablePromise<AddressDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userID}/address',
            path: {
                'userID': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update user address by ID
     * Update user address by ID
     * @param userId
     * @param addressId
     * @param requestBody Update address object
     * @returns AddressDto Successful operation
     * @throws ApiError
     */
    public static updateUserAddressById(
        userId: string,
        addressId: string,
        requestBody?: AddressDto,
    ): CancelablePromise<AddressDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{userID}/address/{addressID}',
            path: {
                'userID': userId,
                'addressID': addressId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Delete user address by ID
     * Delete user address by ID
     * @param userId
     * @param addressId
     * @returns any successful operation
     * @throws ApiError
     */
    public static deleteUserAddressById(
        userId: string,
        addressId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{userID}/address/{addressID}',
            path: {
                'userID': userId,
                'addressID': addressId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Get all user items
     * Get all items for an existing user
     * @param userId
     * @returns ItemMetaDataDto successful operation
     * @throws ApiError
     */
    public static getUserItems(
        userId: string,
    ): CancelablePromise<Array<ItemMetaDataDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userID}/items',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Get all user ratings
     * Get all ratings for an existing user
     * @param userId
     * @returns UserRatingDto successful operation
     * @throws ApiError
     */
    public static getAllUserRatings(
        userId: string,
    ): CancelablePromise<Array<UserRatingDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userID}/ratings',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID supplied`,
                404: `User not found`,
            },
        });
    }

    /**
     * Get user payment methods
     * Retrieve the payment methods of a user
     * @param userId
     * @returns PaymentMethodDto Successfully retrieved user payment methods
     * @throws ApiError
     */
    public static getUserPaymentMethods(
        userId: string,
    ): CancelablePromise<Array<PaymentMethodDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userID}/payment',
            path: {
                'userID': userId,
            },
            errors: {
                400: `Invalid user ID`,
            },
        });
    }

    /**
     * Add payment method
     * Add a new payment method for a user
     * @param userId
     * @param requestBody
     * @returns PaymentMethodDto Successfully added payment method
     * @throws ApiError
     */
    public static addPaymentMethod(
        userId: string,
        requestBody: NewPaymentMethodDto,
    ): CancelablePromise<PaymentMethodDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userID}/payment',
            path: {
                'userID': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user ID or payment method data`,
            },
        });
    }

    /**
     * Update payment method
     * Update a payment method for a user
     * @param userId
     * @param paymentMethodId
     * @param requestBody
     * @returns PaymentMethodDto Successfully updated payment method
     * @throws ApiError
     */
    public static updatePaymentMethod(
        userId: string,
        paymentMethodId: string,
        requestBody: PaymentMethodDto,
    ): CancelablePromise<PaymentMethodDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{userID}/payment/{paymentMethodID}',
            path: {
                'userID': userId,
                'paymentMethodID': paymentMethodId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user ID or payment method data`,
            },
        });
    }

    /**
     * Delete paymentMethod by ID
     * Delete paymentMethod by ID of the logged in user
     * @param userId
     * @param paymentMethodId
     * @returns any successful operation
     * @throws ApiError
     */
    public static deletePaymentMethod(
        userId: string,
        paymentMethodId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{userID}/payment/{paymentMethodID}',
            path: {
                'userID': userId,
                'paymentMethodID': paymentMethodId,
            },
            errors: {
                400: `Invalid user ID or paymentMethodID supplied`,
                404: `User not found`,
            },
        });
    }

}
