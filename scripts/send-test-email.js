#!/usr/bin/env node
// Simple test script to send an email using the same SMTP env vars the app uses.
// It will try to read a `.env.local` file in the project root and load KEY=VALUE pairs.

const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

function loadDotEnv(dotenvPath){
  if(!fs.existsSync(dotenvPath)) return
  const src = fs.readFileSync(dotenvPath, 'utf8')
  src.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if(m){
      let val = m[2]
      // Remove optional surrounding quotes
      if(val.startsWith('"') && val.endsWith('"')) val = val.slice(1,-1)
      if(val.startsWith("'") && val.endsWith("'")) val = val.slice(1,-1)
      process.env[m[1]] = val
    }
  })
}

// Load .env.local if present
const dotenvPath = path.resolve(process.cwd(), '.env.local')
loadDotEnv(dotenvPath)

async function main(){
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
  const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false') === 'true'
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER
  const EMAIL_TO = process.env.EMAIL_TO || process.env.SMTP_USER

  if(!SMTP_USER || !SMTP_PASS){
    console.error('Missing SMTP_USER or SMTP_PASS in environment. Add them to .env.local before running this script.')
    process.exit(1)
  }

  console.log('Using SMTP host:', SMTP_HOST, 'port:', SMTP_PORT)

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  try{
    // verify connection
    await transporter.verify()
    console.log('SMTP connection OK')
  } catch(err){
    console.error('SMTP connection failed:', err && err.message ? err.message : err)
    process.exit(1)
  }

  const subject = `🚨 Test: envío desde Terramar`;
  const text = `Prueba de envío desde la app Terramar.\n\nSi recibes este correo, la configuración SMTP está correcta.`

  try{
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: EMAIL_TO,
      subject,
      text,
      html: `<p>${text.replace(/\n/g,'<br>')}</p>`,
    })
    console.log('Mail sent. messageId=', info.messageId)
    // Nodemailer test accounts might have preview URL
    if(nodemailer.getTestMessageUrl){
      const preview = nodemailer.getTestMessageUrl(info)
      if(preview) console.log('Preview URL:', preview)
    }
  } catch(err){
    console.error('Error sending mail:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

main()
