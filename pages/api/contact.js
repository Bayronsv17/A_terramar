import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { firstName, lastName, birthYear, phone, address, email } = req.body || {}

  // Server-side validation
  const errors = {}
  const trim = v => (v == null ? '' : String(v).trim())
  if (!trim(firstName)) errors.firstName = 'Required'
  if (!trim(lastName)) errors.lastName = 'Required'
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
  if (firstName && !nameRegex.test(String(firstName))) errors.firstName = 'Invalid characters'
  if (lastName && !nameRegex.test(String(lastName))) errors.lastName = 'Invalid characters'
  if (!trim(phone)) errors.phone = 'Required'
  else if (!/^[0-9]{10}$/.test(String(phone))) errors.phone = 'Phone must have 10 digits'
  if (!trim(address)) errors.address = 'Required'
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email'
  const currentYear = new Date().getFullYear()
  const maxBirthYear = currentYear - 18
  if (!birthYear) errors.birthYear = 'Required'
  else {
    const by = Number(birthYear)
    if (!/^[0-9]{4}$/.test(String(birthYear))) errors.birthYear = 'Must be 4 digits'
    else if (isNaN(by) || by < 1950 || by > maxBirthYear) errors.birthYear = `Year must be between 1950 and ${maxBirthYear}`
  }
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors })

  // Build subject and bodies
  const subject = `🚨 NUEVA CONSULTORA: ${firstName} ${lastName || ''}`
  const bodyText = `Nombre: ${firstName} ${lastName || ''}\nEmail: ${email}\nAño de nacimiento: ${birthYear || ''}\nTeléfono: ${phone || ''}\nDomicilio: ${address || ''}`

  const bodyHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#f7fafc;padding:20px;">
      <table role="presentation" style="max-width:680px;margin:0 auto;width:100%;">
        <tr><td>
          <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.06);">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;background:#fff7ed;">
              <div style="font-size:18px;font-weight:700;color:#b45309;">INFORMACION</div>
              <div style="flex:0 0 auto;display:flex;align-items:center;gap:12px;">
                <img src="cid:logo@terramar" alt="Terramar" style="height:44px;display:block" />
              </div>
            </div>
            <div style="padding:18px 20px 24px 20px;">
              <div style="font-weight:600;margin-bottom:8px;color:#111827">${firstName} ${lastName || ''}</div>
            </div>
            <div style="padding:12px 20px;border-top:1px solid #f1f5f9;font-size:12px;color:#6b7280;">Sent from Terramar</div>
          </div>
        </td></tr>
      </table>
    </div>
  `

  // Try to read logo for inline attachment
  let logoAttachment = null
  try {
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.svg')
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath)
      logoAttachment = { path: logoPath, base64: buf.toString('base64') }
    }
  } catch (e) {
    // ignore
  }

  // Prefer SendGrid if configured, fallback to Nodemailer (SMTP/Ethereal)
  const SENDGRID_KEY = process.env.SENDGRID_API_KEY
  const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const EMAIL_TO = process.env.EMAIL_TO

  try {
    if (SENDGRID_KEY) {
      // Send via SendGrid API
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(SENDGRID_KEY)
      const msg = {
        to: EMAIL_TO,
        from: EMAIL_FROM,
        subject,
        text: bodyText,
        html: bodyHtml,
        mailSettings: { bypassListManagement: { enable: true } }
      }
      if (logoAttachment) {
        msg.attachments = [
          {
            content: logoAttachment.base64,
            filename: 'logo.svg',
            type: 'image/svg+xml',
            disposition: 'inline',
            content_id: 'logo@terramar'
          }
        ]
      }
      await sgMail.send(msg)
      return res.status(200).json({ ok: true, provider: 'sendgrid' })
    } else {
      // Fallback: Nodemailer (SMTP or Ethereal)
      const nodemailer = require('nodemailer')
      const SMTP_HOST = process.env.SMTP_HOST
      const SMTP_PORT = process.env.SMTP_PORT
      const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
      const SMTP_USER = process.env.SMTP_USER
      const SMTP_PASS = process.env.SMTP_PASS

      let transporter
      let usingTestAccount = false
      if (SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_TO) {
        transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT ? Number(SMTP_PORT) : 587,
          secure: SMTP_SECURE,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        })
      } else {
        usingTestAccount = true
        const testAccount = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass }
        })
      }

      const mailOptions = {
        from: EMAIL_FROM,
        to: EMAIL_TO || (usingTestAccount ? (process.env.EMAIL_TO || 'test@example.com') : ''),
        subject,
        text: bodyText,
        html: bodyHtml,
        attachments: logoAttachment ? [{ filename: 'logo.svg', path: logoAttachment.path, cid: 'logo@terramar' }] : undefined
      }

      const info = await transporter.sendMail(mailOptions)
      const result = { ok: true, provider: 'nodemailer', messageId: info.messageId }
      if (usingTestAccount) result.preview = nodemailer.getTestMessageUrl(info)
      return res.status(200).json(result)
    }
  } catch (err) {
    console.error('Error sending mail', err)
    return res.status(500).json({ error: 'Error sending email', detail: String(err && err.message ? err.message : err) })
  }
}
