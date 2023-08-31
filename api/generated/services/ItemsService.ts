/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AvailabilityDto } from '../models/AvailabilityDto';
import type { CategoryEnum } from '../models/CategoryEnum';
import type { ItemDto } from '../models/ItemDto';
import type { ItemMetaDataDto } from '../models/ItemMetaDataDto';
import type { ItemRatingDto } from '../models/ItemRatingDto';
import type { NewFeaturedDto } from '../models/NewFeaturedDto';
import type { NewItemDto } from '../models/NewItemDto';
import type { RentalDto } from '../models/RentalDto';
import type { UserMetaDataDto } from '../models/UserMetaDataDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ItemsService {

    /**
     * Add a new item
     * Add a new item
     * @param requestBody Create a new item
     * @returns ItemDto successful operation
     * @throws ApiError
     */
    public static addItem(
        requestBody?: NewItemDto,
    ): CancelablePromise<ItemDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                405: `Invalid input`,
            },
        });
    }

    /**
     * search item
     * search item using parameters
     * @param term
     * @param category
     * @param priceFrom
     * @param priceTo
     * @param availabilityFrom
     * @param availabilityTo
     * @param latitude
     * @param longitude
     * @param featured
     * @param distance
     * @returns ItemMetaDataDto Successful operation
     * @throws ApiError
     */
    public static searchItem(
        term?: string,
        category?: CategoryEnum,
        priceFrom?: number,
        priceTo?: number,
        availabilityFrom?: string,
        availabilityTo?: string,
        latitude?: number,
        longitude?: number,
        featured?: boolean,
        distance?: number,
    ): CancelablePromise<Array<ItemMetaDataDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/search',
            query: {
                'term': term,
                'category': category,
                'priceFrom': priceFrom,
                'priceTo': priceTo,
                'availabilityFrom': availabilityFrom,
                'availabilityTo': availabilityTo,
                'latitude': latitude,
                'longitude': longitude,
                'featured': featured,
                'distance': distance,
            },
        });
    }

    /**
     * featured items
     * get featured items based on category
     * @param category
     * @returns ItemMetaDataDto Successful operation
     * @throws ApiError
     */
    public static featuredItems(
        category: CategoryEnum,
    ): CancelablePromise<Array<ItemMetaDataDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/featured',
            query: {
                'category': category,
            },
        });
    }

    /**
     * Find item by ID
     * Returns a single item
     * @param itemId
     * @returns ItemDto successful operation
     * @throws ApiError
     */
    public static getItemById(
        itemId: string,
    ): CancelablePromise<ItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Update item by ID
     * Update an existing item by ID
     * @param itemId
     * @param requestBody
     * @returns ItemDto Successful operation
     * @throws ApiError
     */
    public static updateItemById(
        itemId: string,
        requestBody?: ItemDto,
    ): CancelablePromise<ItemDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/items/{itemID}',
            path: {
                'itemID': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Delete item by ID
     * Delete item by ID
     * @param itemId
     * @returns any successful operation
     * @throws ApiError
     */
    public static deleteItemById(
        itemId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/items/{itemID}',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID`,
            },
        });
    }

    /**
     * Get item lender
     * Get item lender
     * @param itemId
     * @returns UserMetaDataDto successful operation
     * @throws ApiError
     */
    public static getItemLender(
        itemId: string,
    ): CancelablePromise<UserMetaDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}/user/lender',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Get item metadata
     * Get item metadata
     * @param itemId
     * @returns ItemMetaDataDto successful operation
     * @throws ApiError
     */
    public static getItemMetadata(
        itemId: string,
    ): CancelablePromise<ItemMetaDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}/metadata',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Get item availability
     * Get item availability
     * @param itemId
     * @returns AvailabilityDto successful operation
     * @throws ApiError
     */
    public static getItemAvailability(
        itemId: string,
    ): CancelablePromise<AvailabilityDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}/availability',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Add item availability
     * Add item availability
     * @param itemId
     * @param requestBody Create a new item availability
     * @returns AvailabilityDto successful operation
     * @throws ApiError
     */
    public static addItemAvailability(
        itemId: string,
        requestBody?: AvailabilityDto,
    ): CancelablePromise<AvailabilityDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/{itemID}/availability',
            path: {
                'itemID': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
                405: `Invalid input`,
            },
        });
    }

    /**
     * Get all item rentals
     * Get all rentals for an existing item
     * @param itemId
     * @returns RentalDto successful operation
     * @throws ApiError
     */
    public static getItemRentals(
        itemId: string,
    ): CancelablePromise<Array<RentalDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}/rentals',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Get all item ratings
     * Get all ratings for an existing item
     * @param itemId
     * @returns ItemRatingDto successful operation
     * @throws ApiError
     */
    public static getAllItemRatings(
        itemId: string,
    ): CancelablePromise<Array<ItemRatingDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/{itemID}/ratings',
            path: {
                'itemID': itemId,
            },
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
            },
        });
    }

    /**
     * Add featured item
     * Add featured item
     * @param itemId
     * @param requestBody Create a new featured item
     * @returns ItemDto successful operation
     * @throws ApiError
     */
    public static addFeaturedItem(
        itemId: string,
        requestBody?: NewFeaturedDto,
    ): CancelablePromise<ItemDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/{itemID}/featured',
            path: {
                'itemID': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid item ID supplied`,
                404: `Item not found`,
                405: `Invalid input`,
            },
        });
    }

}
