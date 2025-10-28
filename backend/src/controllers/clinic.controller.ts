import { Request, Response } from "express";

export const registerClinic = (req: Request, res: Response) => {
  res.send("Register new clinic endpoint hit");
};

export const getClinics = (req: Request, res: Response) => {
  res.send("Get all clinics endpoint hit");
};

export const getClinicById = (req: Request, res: Response) => {
  res.send(`Get clinic by ID: ${req.params.id}`);
};

export const updateClinic = (req: Request, res: Response) => {
  res.send(`Update clinic with ID: ${req.params.id}`);
};
