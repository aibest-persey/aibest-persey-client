const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

/**
 * Validate the sign-up form fields.
 *
 * @param {{ firstName: string, lastName: string, username: string, email: string, password: string, confirmPassword: string }} fields
 * @returns {{ [field: string]: string }} — An object whose keys are field names and values are error messages.
 *                                          An empty object means the form is valid.
 */
export function validateSignUp(fields) {
  const errors = {}

  const { firstName, lastName, username, email, password, confirmPassword } = fields

  if (firstName && firstName.trim().length > 50) {
    errors.firstName = "First name must be 50 characters or fewer."
  }

  if (lastName && lastName.trim().length > 50) {
    errors.lastName = "Last name must be 50 characters or fewer."
  }

  if (!username || !username.trim()) {
    errors.username = "Username is required."
  } else if (!USERNAME_RE.test(username.trim())) {
    errors.username =
      "Username must be 3–20 characters and contain only letters, numbers, or underscores."
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
