import { ValidationError } from "../types/error.types";
import { RegisterInput, LoginInput } from "../types/auth.types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LEN = 8;
const PASSWORD_MAX_LEN = 128;

export const validateEmail = (email: string): void => {
  if (!email || !EMAIL_RE.test(email)) throw new ValidationError(`Invalid email format: "${email}"`);
};

export const validatePassword = (password: string): void => {
  if (!password || password.length < PASSWORD_MIN_LEN) throw new ValidationError(`Password must be at least ${PASSWORD_MIN_LEN} characters`);
  if (password.length > PASSWORD_MAX_LEN) throw new ValidationError(`Password must not exceed ${PASSWORD_MAX_LEN} characters`);
};

export const validateName = (name: string): void => {
  if (!name || name.trim().length === 0) throw new ValidationError("Name is required");
  if (name.trim().length > 100) throw new ValidationError("Name must not exceed 100 characters");
};

export const validateRegister = (input: RegisterInput): void => {
  validateEmail(input.email);
  validateName(input.name);
  validatePassword(input.password);
};

export const validateLogin = (input: LoginInput): void => {
  validateEmail(input.email);
  if (!input.password) throw new ValidationError("Password is required");
};
