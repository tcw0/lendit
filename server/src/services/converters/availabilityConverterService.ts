import { AvailabilityDto, TimespanDto, WeekdayEnum } from '@api/generated'
import { ITimeSpanDao } from 'src/models/TimeSpanDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { IAvailabilityDao, WeekdayEnumDao } from '../../models/AvailabilityDao'

/**
 * Converts a time span DAO to a time span DTO.
 * @param {ITimeSpanDao} timeSpanDao the time span DAO to convert.
 * @returns {TimespanDto} the converted time span.
 */
export const convertTimeSpanDaoToDto = (
  timeSpanDao: ITimeSpanDao,
): TimespanDto => {
  const timeSpanDto: TimespanDto = {
    start: timeSpanDao.start.toISOString(),
    end: timeSpanDao.end.toISOString(),
  }

  return timeSpanDto
}

/**
 * Converts an times pan DAO to an availability DTO.
 * @param {TimespanDto} timeSpanDto the time span DTO to convert.
 * @returns {ITimeSpanDao} the converted time span.
 */
export const convertTimeSpanDtoToDao = (
  timeSpanDto: TimespanDto,
): ITimeSpanDao => {
  const timeSpanDao: ITimeSpanDao = {
    start: new Date(timeSpanDto.start),
    end: new Date(timeSpanDto.end),
  } as ITimeSpanDao
  return timeSpanDao
}

/**
 * Converts a weekday enum DAO to a weekday enum DTO.
 * @param {WeekdayEnum} weekdayEnum the weekday enum to convert.
 * @throws {ApiError} if the weekday enum is invalid.
 * @returns {WeekdayEnumDao} the converted weekday enum.
 */
export const convertWeekdayEnumDtoToDao = (
  weekdayEnum: WeekdayEnum,
): WeekdayEnumDao => {
  switch (weekdayEnum) {
    case WeekdayEnum.MONDAY:
      return WeekdayEnumDao.MONDAY
    case WeekdayEnum.TUESDAY:
      return WeekdayEnumDao.TUESDAY
    case WeekdayEnum.WEDNESDAY:
      return WeekdayEnumDao.WEDNESDAY
    case WeekdayEnum.THURSDAY:
      return WeekdayEnumDao.THURSDAY
    case WeekdayEnum.FRIDAY:
      return WeekdayEnumDao.FRIDAY
    case WeekdayEnum.SATURDAY:
      return WeekdayEnumDao.SATURDAY
    case WeekdayEnum.SUNDAY:
      return WeekdayEnumDao.SUNDAY
    default:
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Invalid weekday of ${weekdayEnum}.`,
      )
  }
}

/**
 * Converts a weekday enum DAO to a weekday enum DTO.
 * @param {WeekdayEnumDao} weekdayEnum the weekday enum to convert.
 * @returns {WeekdayEnum} the converted weekday enum.
 */
export const convertWeekdayEnumDaoToDto = (
  weekdayEnum: WeekdayEnumDao,
): WeekdayEnum => {
  switch (weekdayEnum) {
    case WeekdayEnumDao.MONDAY:
      return WeekdayEnum.MONDAY
    case WeekdayEnumDao.TUESDAY:
      return WeekdayEnum.TUESDAY
    case WeekdayEnumDao.WEDNESDAY:
      return WeekdayEnum.WEDNESDAY
    case WeekdayEnumDao.THURSDAY:
      return WeekdayEnum.THURSDAY
    case WeekdayEnumDao.FRIDAY:
      return WeekdayEnum.FRIDAY
    case WeekdayEnumDao.SATURDAY:
      return WeekdayEnum.SATURDAY
    case WeekdayEnumDao.SUNDAY:
      return WeekdayEnum.SUNDAY
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid weekday of ${weekdayEnum}.`,
      )
  }
}

/**
 * Converts an availability DAO to an availability DTO.
 * @param {IAvailabilityDao} availabilityDao the availability DAO to convert.
 * @returns {AvailabilityDto} the converted availability.
 */
export const convertAvailabilityDaoToDto = (
  availabilityDao: IAvailabilityDao,
): AvailabilityDto => {
  const itemAvailabilityDto: AvailabilityDto = {
    whitelist: availabilityDao.whitelist.map(convertTimeSpanDaoToDto),
    blacklist: availabilityDao.blacklist.map(convertTimeSpanDaoToDto),
    availableWeekdays: availabilityDao.availableWeekdays.map(
      convertWeekdayEnumDaoToDto,
    ),
  }

  return itemAvailabilityDto
}

/**
 * Converts an availability DTO to an availability DAO.
 * @param {AvailabilityDto} availabilityDto the availability DTO to convert.
 * @returns {IAvailabilityDao} the converted availability.
 */
export const convertAvailabilityDtoToDao = (
  availabilityDto: AvailabilityDto,
): IAvailabilityDao => {
  const itemAvailabilityDao: IAvailabilityDao = {
    whitelist: availabilityDto.whitelist.map(convertTimeSpanDtoToDao),
    blacklist: availabilityDto.blacklist.map(convertTimeSpanDtoToDao),
    availableWeekdays: availabilityDto.availableWeekdays.map(
      convertWeekdayEnumDtoToDao,
    ),
  } as IAvailabilityDao

  return itemAvailabilityDao
}
