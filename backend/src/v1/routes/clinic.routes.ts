import express from "express";
const router = express.Router();
import {
  registerClinic,
  getClinics,
  getClinicById,
  updateClinic,
} from "../../controllers/clinic.controller";
import { validate } from "uuid";
import { clinicValidator } from "../../validators/clinic.validator";

router.post("/register", clinicValidator, validate, registerClinic);

router.get("/:id", getClinicById);

router.get("/", getClinics);

router.patch("/:id", updateClinic);

router.get("/:id/settings", (req, res) => res.send("Get clinic settings"));

router.patch("/:id/settings", (req, res) => res.send("Update clinic settings"));

export default router;
