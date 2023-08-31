// helper functions

import { AggregatedRatingDto } from '@api/models/AggregatedRatingDto'

/**
 * Turn int number into price
 * @param num
 * @returns string as price
 */
export function intToPrice(num?: number): string {
  if (typeof num === 'undefined') {
    return ''
  }

  const digit = Math.floor(num / 100).toString()
  const decimal = (num % 100).toString().padStart(2, '0')

  return '€'.concat(digit, '.', decimal)
}

/**
 * Round double number to two decimals
 * @param num
 * @returns string with two decimals
 */
export function numToTwoDecimals(num?: number): string {
  if (typeof num === 'undefined') {
    return ''
  }

  return (Math.round(num * 100) / 100).toFixed(2)
}

export function intToDecimal(num?: number): string {
  if (typeof num === 'undefined') {
    return ''
  }

  const digit = Math.floor(num / 100).toString()
  const decimal = (num % 100).toString().padStart(2, '0')

  return digit.concat('.', decimal)
}

export function displayRating(avgRating: AggregatedRatingDto | undefined) {
  return avgRating && avgRating.count !== 0
    ? `${avgRating?.avgRating.toFixed(2)} (${avgRating.count})`
    : 'No reviews'
}
