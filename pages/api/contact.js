import dbConnect from '../../lib/dbConnect'
import ContactSubmission from '../../models/ContactSubmission'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Connect to DB
  await dbConnect()

  const { firstName, lastName, birthDate, birthYear, phone, address, email } = req.body || {}

  // Server-side validation
  const errors = {}
  const trim = v => (v == null ? '' : String(v).trim())

  if (!trim(firstName)) errors.firstName = 'Required'
  if (!trim(lastName)) errors.lastName = 'Required'

  // Basic Regex for name
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
  if (firstName && !nameRegex.test(String(firstName))) errors.firstName = 'Invalid characters'
  if (lastName && !nameRegex.test(String(lastName))) errors.lastName = 'Invalid characters'

  if (!trim(phone)) errors.phone = 'Required'
  else if (!/^[0-9]{10}$/.test(String(phone))) errors.phone = 'Phone must have 10 digits'

  if (!trim(address)) errors.address = 'Required'

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email'

  // Validate Date or Year
  // If birthDate is provided (native date picker), prefer that.
  if (!birthDate && !birthYear) errors.birthYear = 'Required'

  if (birthYear) {
    const currentYear = new Date().getFullYear()
    const maxBirthYear = currentYear - 18
    const by = Number(birthYear)

    if (!/^[0-9]{4}$/.test(String(birthYear))) errors.birthYear = 'Must be 4 digits'
    else if (isNaN(by) || by < 1950 || by > maxBirthYear) errors.birthYear = `Year must be between 1950 and ${maxBirthYear}`
  }

  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors })

  try {
    // Determine birthDate string to save
    let finalBirthDate = birthDate
    if (!finalBirthDate && birthYear) {
      finalBirthDate = `${birthYear}-01-01` // Fallback if only year
    }

    const submission = await ContactSubmission.create({
      firstName: trim(firstName),
      lastName: trim(lastName),
      birthDate: finalBirthDate,
      phone: String(phone).replace(/\D/g, ''),
      address: trim(address),
      email: trim(email),
      status: 'new'
    })

    return res.status(200).json({ ok: true, id: submission._id })

  } catch (err) {
    console.error('Error saving submission', err)
    return res.status(500).json({ error: 'Error saving data', detail: err.message })
  }
}
