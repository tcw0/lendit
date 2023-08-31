import { AddressDto } from '@api/generated'
import { IAddressDao } from '../../models/AddressDao'

/**
 * Converts an address DAO to an address DTO.
 * @param {IAddressDao} addressDao the address to convert.
 * @returns {AddressDto} the converted address.
 */
export const convertAddressDaoToDto = (addressDao: IAddressDao): AddressDto => {
  const addressDto: AddressDto = {
    id: addressDao._id,
    street: addressDao.street,
    city: addressDao.city,
    zipCode: addressDao.zipCode,
    latitude: addressDao.latitude,
    longitude: addressDao.longitude,
  }

  return addressDto
}

export default convertAddressDaoToDto
