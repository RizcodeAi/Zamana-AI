import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../config/database";
import { JWT_CONFIG } from "../config/jwt";
import { validateRegister, validateLogin } from "../utils/validators";
import { RegisterInput, LoginInput, AuthTokens } from "../types/auth.types";
import { ConflictError, ValidationError, AuthenticationError } from "../types/error.types";
import { logger } from "../utils/logger";

const SALT_ROUNDS = 12;

export const register = async (input: RegisterInput) => {
  validateRegister(input);

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new ConflictError("A user with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  let organizationId: string | null = null;
  if (input.organizationName?.trim()) {
    const org = await prisma.organization.create({
      data: { name: input.organizationName.trim(), slug: input.organizationName.trim().toLowerCase().replace(/\s+/g, "-") },
    });
    organizationId = org.id;
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name.trim(),
      passwordHash,
      organizationId,
      role: "MEMBER",
    },
  });

  const tokens = await generateTokens(user.id);
  logger.info("User registered", { userId: user.id, email: user.email });

  return { user, tokens };
};

export const login = async (input: LoginInput) => {
  validateLogin(input);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthenticationError("Invalid email or password");

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) throw new AuthenticationError("Invalid email or password");

  const tokens = await generateTokens(user.id);
  logger.info("User logged in", { userId: user.id, email: user.email });

  return { user, tokens };
};

const generateTokens = (userId: string): AuthTokens => {
  const accessToken = jwt.sign({ userId }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn } as SignOptions);
  const refreshToken = jwt.sign({ userId }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.refreshExpiresIn } as SignOptions);
  return { accessToken, refreshToken };
};
