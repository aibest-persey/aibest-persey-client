const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_RE = /^\d{6}$/

/**
 * Validate the sign-up form fields (name, surname, email, password, confirm password).
 * Username is generated internally — the mockup doesn't expose it as a field.
 *
 * @param {{ firstName: string, lastName: string, email: string, password: string, confirmPassword: string }} fields
 * @returns {{ [field: string]: string }} — An object whose keys are field names and values are error messages.
 *                                          An empty object means the form is valid.
 */
export function validateSignUp(fields) {
  const errors = {}

  const { firstName, lastName, email, password, confirmPassword } = fields

  if (!firstName || !firstName.trim()) {
    errors.firstName = "Name is required."
  } else if (firstName.trim().length > 50) {
    errors.firstName = "Name must be 50 characters or fewer."
  }

  if (!lastName || !lastName.trim()) {
    errors.lastName = "Surname is required."
  } else if (lastName.trim().length > 50) {
    errors.lastName = "Surname must be 50 characters or fewer."
  }

  if (!email || !email.trim()) {
    errors.email = "Email is required."
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address."
  }

  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password."
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match."
  }

  return errors
}

/**
 * Validate the sign-in form fields.
 *
 * @param {{ identifier: string, password: string }} fields
 * @returns {{ [field: string]: string }}
 */
export function validateSignIn(fields) {
  const errors = {}

  const { identifier, password } = fields

  if (!identifier || !identifier.trim()) {
    errors.identifier = "Email or username is required."
  }

  if (!password) {
    errors.password = "Password is required."
  }

  return errors
}

/**
 * Validate a signup verification code.
 *
 * @param {{ code: string }} fields
 * @returns {{ [field: string]: string }}
 */
export function validateVerificationCode(fields) {
  const errors = {}
  const { code } = fields

  if (!code || !code.trim()) {
    errors.code = "Verification code is required."
  } else if (!CODE_RE.test(code.trim())) {
    errors.code = "Enter the 6-digit code from your email."
  }

  return errors
}

/**
 * Validate the forgot-password form.
 *
 * @param {{ email: string }} fields
 * @returns {{ [field: string]: string }}
 */
export function validateForgotPassword(fields) {
  const errors = {}
  const { email } = fields

  if (!email || !email.trim()) {
    errors.email = "Email is required."
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address."
  }

  return errors
}

/**
 * Validate the reset-password form.
 *
 * @param {{ password: string, confirmPassword: string }} fields
 * @returns {{ [field: string]: string }}
 */
export function validateResetPassword(fields) {
  const errors = {}
  const { password, confirmPassword } = fields

  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password."
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match."
  }

  return errors
}
