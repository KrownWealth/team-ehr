import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../services/database.service";
import logger from "../utils/logger.utils";
import { EmailService } from "../services/email.service";

const emailService = new EmailService();

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.createUser(email, {
      firstName,
      lastName,
      role: role || "STAFF",
      password: hashedPassword,
      isVerified: false,
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    await emailService.sendRegisterEmail(email);

    res.status(201).json({
      status: "success",
      data: { user: { ...user, password: undefined }, token },
    });
  } catch (error) {
    logger.error("Error in register:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({
      status: "success",
      data: { user: { ...user, password: undefined }, token },
    });
  } catch (error) {
    logger.error("Error in login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
