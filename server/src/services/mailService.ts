import { SendSmtpEmail, SendSmtpEmailAttachment } from 'sib-api-v3-typescript'
import { IUserDao } from 'src/models/UserDao'
import fs from 'fs'
import logger from 'src/middleware/logger/logger'
import { IRentalDao, InsuranceTypeEnumDao } from 'src/models/RentalDao'
import PDFDocumentWithTables from 'pdfkit-table'
import { IItemDao } from 'src/models/ItemDao'
import { transactionAPI } from 'src/config/mailTransactionService'
import { PassThrough } from 'stream'
import mongoose from 'mongoose'
import env from '../config/env'
import { getUserByUserId, getVerificationIdForUser } from './userService'
import { getItemById } from './itemService'

/**
 * Send an email.
 * @param {string} to the email address of the recipient
 * @param {string} subject the subject of the email
 * @param {string} html the html content of the email
 * @param {string?} from the email address of the sender, noreply@lendit.com by default
 * @returns {Promise<void>}
 */
export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  from?: string,
  attachment?: Buffer,
): Promise<void> => {
  const mail = new SendSmtpEmail()
  mail.sender = { name: 'LendIt', email: from || 'noreply@lendit.com' }
  mail.to = [{ email: to }]
  mail.htmlContent = html
  mail.subject = subject
  if (attachment) {
    const attachmentObj = new SendSmtpEmailAttachment()
    attachmentObj.name = 'insurance_certificate.pdf'
    attachmentObj.content = attachment.toString('base64')
    mail.attachment = [attachmentObj]
  }

  try {
    await transactionAPI.sendTransacEmail(mail)
    Promise.resolve()
  } catch (error) {
    Promise.reject(error)
  }
}

/**
 * Send a verification email to the user.
 * @param user the user to send the verification email to
 */
export const sendVerificationEmail = async (user: IUserDao): Promise<void> => {
  const templatePath = './src/assets/SignUpTemplate.html'
  try {
    const template = fs.readFileSync(templatePath, 'utf-8')
    // replace the placeholders with the actual values
    const verificationId = await getVerificationIdForUser(user._id)
    const html = template
      .replace('%%user%%', user.name)
      .replace(
        '%%verificationlink%%',
        `${env.FRONTEND_URL}/verify/${user._id.toString()}/${verificationId}`,
      )
      .replaceAll('%%baseurl%%', env.FRONTEND_URL as string)
    await sendMail(user.email, 'Verify your email address', html)
  } catch (error) {
    logger.error(`Failed to send verification message: ${error}`)
  }
}

/**
 * Turn int number into price
 * @param num
 * @returns string as price
 */
const intToPrice = (num: number): string => {
  const digit = Math.floor(num / 100).toString()
  const decimal = (num % 100).toString().padStart(2, '0')

  return '€'.concat(digit, '.', decimal)
}

/**
 *
 * @param {IUserDao} user the user to send the verification email to
 * @param {IRentalDao} rental the rental for which the insurance is bought
 * @param {IItemDao} item the item for which the insurance is bought
 */
export const sendInsuranceMail = async (
  user: IUserDao,
  rental: IRentalDao,
  item: IItemDao,
): Promise<void> => {
  const doc: PDFDocumentWithTables = new PDFDocumentWithTables({
    layout: 'portrait',
    size: 'A4',
  })

  const stream = new PassThrough()
  doc.pipe(stream)

  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff')

  const distanceMargin = 20
  doc
    .fillAndStroke('#152944')
    .lineWidth(20)
    .lineJoin('round')
    .rect(
      distanceMargin,
      distanceMargin,
      doc.page.width - distanceMargin * 2,
      doc.page.height - distanceMargin * 2,
    )
    .stroke()

  const maxWidth = 200
  const maxHeight = 200
  doc.image(
    'src/assets/lenditLogo.png',
    doc.page.width / 2 - maxWidth / 2,
    60,
    {
      fit: [maxWidth, maxHeight],
      align: 'center',
    },
  )

  doc.moveDown(15)
  doc
    .fontSize(25)
    .text('LendIt Insurance Certificate', { align: 'center', underline: true })
  doc.moveDown(2)
  doc
    .fontSize(12)
    .text(
      `Dear ${user.name},\n` +
        'thanks for choosing lendit insurance. ' +
        'We are pleased to provide you with your insurance certificate, ' +
        'confirming your coverage details. This certificate serves as ' +
        'tangible evidence of our commitment to safeguarding your interests.',
      { align: 'justify' },
    )
  doc.moveDown()
  doc
    .fontSize(12)
    .text(
      'Please review your insurance certificate for the terms and conditions ' +
        'of your policy, including coverage limits and effective dates.',
      { align: 'justify' },
    )

  doc.moveDown()

  const table = {
    title: 'Insurance Policies',
    headers: ['Booked', 'Policy'],
    rows: [
      [
        rental.insuranceType === InsuranceTypeEnumDao.BASIC ? 'x' : '',
        'Basic\n- up to €50.00\n- €10.00 deductable\n- no self-inflicted damages',
      ],
      [
        rental.insuranceType === InsuranceTypeEnumDao.PREMIUM ? 'x' : '',
        'Premium\n- up to €500.00\n- no deductable\n- covers self-inflicted damages',
      ],
    ],
  }
  await doc.table(table, {
    columnsSize: [doc.page.width / 16, (doc.page.width / 16) * 15],
  })

  doc.moveDown(2)

  doc
    .fontSize(12)
    .text(
      `The insurance is for the following item: ${
        item.title
      } (id: ${item._id.toString()}).`,
      { align: 'justify' },
    )
  doc
    .fontSize(12)
    .text(
      `The insurance is for the timespan: ${rental.startRental.toLocaleDateString()} to ${rental.endRental.toLocaleDateString()}.`,
      { align: 'justify' },
    )

  doc.moveDown()

  doc
    .fontSize(12)
    .text(
      `The premium of ${intToPrice(
        rental.payment.insuranceAmount,
      )} was paid at ${rental.payment.paymentFromRenter?.toLocaleString()}`,
      { align: 'justify' },
    )

  doc.moveDown(2)

  doc.fontSize(12).text('Best regards,\nYour lendit team', { align: 'center' })

  doc.end()

  const chunks: Buffer[] = []

  stream.on('data', chunk => chunks.push(chunk))
  stream.on('end', () => {
    const pdfData = Buffer.concat(chunks)
    const templatePath = './src/assets/InsuranceTemplate.html'
    try {
      const template = fs.readFileSync(templatePath, 'utf-8')
      // replace the placeholders with the actual values
      const html = template
        .replace('%%user%%', user.name)
        .replace('%%baseurl%%', env.FRONTEND_URL as string)
      sendMail(
        user.email,
        'Your Insurance Certificate',
        html,
        undefined,
        pdfData,
      )
    } catch (error) {
      logger.error(`Failed to send insurance message: ${error}`)
    }
  })
}

export const prepareAndSendInsuranceMail = async (
  rental: IRentalDao,
): Promise<void> => {
  if (
    rental.insuranceType === InsuranceTypeEnumDao.BASIC ||
    rental.insuranceType === InsuranceTypeEnumDao.PREMIUM
  ) {
    const user = await getUserByUserId(
      new mongoose.Types.ObjectId(rental.renterId.toString()),
    )
    const item = await getItemById(
      new mongoose.Types.ObjectId(rental.itemId.toString()),
    )
    if (user && item) {
      await sendInsuranceMail(user, rental, item)
      logger.info('Successfully sent insurance mail.')
    } else {
      logger.error(
        `Failed to send insurance mail for rental ${rental._id.toString()}`,
      )
    }
  }
}
