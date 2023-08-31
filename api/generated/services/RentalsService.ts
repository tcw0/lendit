/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatMessageDto } from '../models/ChatMessageDto';
import type { HandoverDto } from '../models/HandoverDto';
import type { HandoverTypeEnum } from '../models/HandoverTypeEnum';
import type { ItemMetaDataDto } from '../models/ItemMetaDataDto';
import type { ItemRatingDto } from '../models/ItemRatingDto';
import type { NewChatMessageDto } from '../models/NewChatMessageDto';
import type { NewHandoverDto } from '../models/NewHandoverDto';
import type { NewRatingDto } from '../models/NewRatingDto';
import type { NewRentalDto } from '../models/NewRentalDto';
import type { PaymentDto } from '../models/PaymentDto';
import type { RentalDto } from '../models/RentalDto';
import type { RentalMetadataDto } from '../models/RentalMetadataDto';
import type { UserMetaDataDto } from '../models/UserMetaDataDto';
import type { UserRatingDto } from '../models/UserRatingDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RentalsService {

    /**
     * Get all rentals
     * Get all rentals
     * @returns RentalMetadataDto successful operation
     * @throws ApiError
     */
    public static getAllRentals(): CancelablePromise<Array<RentalMetadataDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals',
        });
    }

    /**
     * Place new rental
     * Place a new rental for an offered item
     * @param requestBody
     * @returns RentalDto successful operation
     * @throws ApiError
     */
    public static placeRental(
        requestBody?: NewRentalDto,
    ): CancelablePromise<RentalDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                405: `Invalid input`,
            },
        });
    }

    /**
     * Get an existing Rental by ID
     * Get an existing Rental by ID
     * @param rentalId
     * @returns RentalDto Successful operation
     * @throws ApiError
     */
    public static getRentalById(
        rentalId: string,
    ): CancelablePromise<RentalDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Accept rental
     * Accept a rental request
     * @param rentalId
     * @returns RentalDto successful operation
     * @throws ApiError
     */
    public static acceptRental(
        rentalId: string,
    ): CancelablePromise<RentalDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/accept',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Decline rental
     * Decline a rental request
     * @param rentalId
     * @returns RentalDto successful operation
     * @throws ApiError
     */
    public static declineRental(
        rentalId: string,
    ): CancelablePromise<RentalDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/decline',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Pay rental
     * Pay for a rental
     * @param rentalId
     * @param paymentId
     * @returns RentalDto successful operation
     * @throws ApiError
     */
    public static payRental(
        rentalId: string,
        paymentId: string,
    ): CancelablePromise<RentalDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/pay/{paymentId}',
            path: {
                'rentalID': rentalId,
                'paymentId': paymentId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get all messages
     * Get all messages for an existing rental by ID
     * @param rentalId
     * @returns ChatMessageDto successful operation
     * @throws ApiError
     */
    public static getAllMessagesForRental(
        rentalId: string,
    ): CancelablePromise<Array<ChatMessageDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/message',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Create new message
     * Create a new message for an existing rental by ID
     * @param rentalId
     * @param requestBody
     * @returns ChatMessageDto successful operation
     * @throws ApiError
     */
    public static createMessage(
        rentalId: string,
        requestBody?: NewChatMessageDto,
    ): CancelablePromise<ChatMessageDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/message',
            path: {
                'rentalID': rentalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Invalid input`,
            },
        });
    }

    /**
     * Get rental payment
     * Get payment for an existing rental by ID
     * @param rentalId
     * @returns PaymentDto successful operation
     * @throws ApiError
     */
    public static getPayment(
        rentalId: string,
    ): CancelablePromise<PaymentDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/payment',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get rental handover
     * Get handover for an existing rental by ID
     * @param rentalId
     * @param handoverType
     * @returns HandoverDto successful operation
     * @throws ApiError
     */
    public static getHandover(
        rentalId: string,
        handoverType: HandoverTypeEnum,
    ): CancelablePromise<HandoverDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/handover',
            path: {
                'rentalID': rentalId,
            },
            query: {
                'handoverType': handoverType,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Create new handover
     * Create a new handover for an existing rental by ID
     * @param rentalId
     * @param requestBody
     * @returns HandoverDto successful operation
     * @throws ApiError
     */
    public static createHandover(
        rentalId: string,
        requestBody?: NewHandoverDto,
    ): CancelablePromise<HandoverDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/handover',
            path: {
                'rentalID': rentalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Invalid input`,
            },
        });
    }

    /**
     * Accept handover
     * Accept a handover for an existing rental by ID
     * @param rentalId
     * @param handoverType
     * @returns HandoverDto successful operation
     * @throws ApiError
     */
    public static acceptHandover(
        rentalId: string,
        handoverType: HandoverTypeEnum,
    ): CancelablePromise<HandoverDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/handover/accept',
            path: {
                'rentalID': rentalId,
            },
            query: {
                'handoverType': handoverType,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Decline handover
     * Decline a handover for an existing rental by ID
     * @param rentalId
     * @param handoverType
     * @returns any successful operation
     * @throws ApiError
     */
    public static declineHandover(
        rentalId: string,
        handoverType: HandoverTypeEnum,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/handover/decline',
            path: {
                'rentalID': rentalId,
            },
            query: {
                'handoverType': handoverType,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get rental item
     * Get item for an existing rental by ID
     * @param rentalId
     * @returns ItemMetaDataDto successful operation
     * @throws ApiError
     */
    public static getRentalItem(
        rentalId: string,
    ): CancelablePromise<ItemMetaDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/item',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get rental item rating
     * Get rating for an existing rental by ID
     * @param rentalId
     * @returns ItemRatingDto successful operation
     * @throws ApiError
     */
    public static getRentalItemRating(
        rentalId: string,
    ): CancelablePromise<ItemRatingDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/item/rating',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Create new item rating
     * Create a new rating for an existing rental by ID
     * @param rentalId
     * @param requestBody
     * @returns ItemRatingDto successful operation
     * @throws ApiError
     */
    public static createRentalItemRating(
        rentalId: string,
        requestBody?: NewRatingDto,
    ): CancelablePromise<ItemRatingDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/item/rating',
            path: {
                'rentalID': rentalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Invalid input`,
            },
        });
    }

    /**
     * Get rental renter
     * Get renter for an existing rental by ID
     * @param rentalId
     * @returns UserMetaDataDto successful operation
     * @throws ApiError
     */
    public static getRentalRenter(
        rentalId: string,
    ): CancelablePromise<UserMetaDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/user/renter',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get rental renter rating
     * Get rating for an existing rental by ID
     * @param rentalId
     * @returns UserRatingDto successful operation
     * @throws ApiError
     */
    public static getRentalRenterRating(
        rentalId: string,
    ): CancelablePromise<UserRatingDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/user/renter/rating',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Create new renter rating
     * Create a new rating for an existing rental by ID
     * @param rentalId
     * @param requestBody
     * @returns UserRatingDto successful operation
     * @throws ApiError
     */
    public static createRentalRenterRating(
        rentalId: string,
        requestBody?: NewRatingDto,
    ): CancelablePromise<UserRatingDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/user/renter/rating',
            path: {
                'rentalID': rentalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Invalid input`,
            },
        });
    }

    /**
     * Get rental lender
     * Get lender for an existing rental by ID
     * @param rentalId
     * @returns UserMetaDataDto successful operation
     * @throws ApiError
     */
    public static getRentalLender(
        rentalId: string,
    ): CancelablePromise<UserMetaDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/user/lender',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Get rental lender rating
     * Get rating for an existing rental by ID
     * @param rentalId
     * @returns UserRatingDto successful operation
     * @throws ApiError
     */
    public static getRentalLenderRating(
        rentalId: string,
    ): CancelablePromise<UserRatingDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rentals/{rentalID}/user/lender/rating',
            path: {
                'rentalID': rentalId,
            },
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
            },
        });
    }

    /**
     * Create new lender rating
     * Create a new rating for an existing rental by ID
     * @param rentalId
     * @param requestBody
     * @returns UserRatingDto successful operation
     * @throws ApiError
     */
    public static createRentalLenderRating(
        rentalId: string,
        requestBody?: NewRatingDto,
    ): CancelablePromise<UserRatingDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rentals/{rentalID}/user/lender/rating',
            path: {
                'rentalID': rentalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid rental ID supplied`,
                404: `Rental not found`,
                405: `Invalid input`,
            },
        });
    }

}
