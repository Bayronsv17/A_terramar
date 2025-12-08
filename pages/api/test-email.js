import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const SMTP_HOST = process.env.SMTP_HOST
  const SMTP_PORT = process.env.SMTP_PORT
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER
  const EMAIL_TO = process.env.EMAIL_TO || SMTP_USER

  if(!SMTP_USER || !SMTP_PASS) return res.status(400).json({ error: 'SMTP not configured' })

  try{
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_SECURE || false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })

    await transporter.verify()

    const attachments = []
    try{
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.svg')
      if(fs.existsSync(logoPath)) attachments.push({ filename: 'logo.svg', path: logoPath, cid: 'logo@terramar' })
    } catch(e){}

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: EMAIL_TO,
      subject: '🚨 Test: correo de prueba desde Terramar',
      text: 'Este es un correo de prueba enviado desde /api/test-email',
      html: '<p>Este es un correo de prueba enviado desde <strong>Terramar</strong>.</p>',
      attachments: attachments.length ? attachments : undefined,
    })

    const out = { ok: true, messageId: info.messageId }
    if(nodemailer.getTestMessageUrl) out.preview = nodemailer.getTestMessageUrl(info)
    return res.status(200).json(out)
  } catch(err){
    console.error('test-email error', err)
    return res.status(500).json({ error: 'Error sending test email', detail: err && err.message })
  }
}
