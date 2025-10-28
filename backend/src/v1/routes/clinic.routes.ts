import express from "express";
const router = express.Router();
import {
  registerClinic,
  getClinics,
  getClinicById,
  updateClinic,
} from "../../controllers/clinic.controller";

router.post("/register", registerClinic);

router.get("/:id", getClinicById);

router.get("/", getClinics);

router.patch("/:id", updateClinic);

router.get("/:id/settings", (req, res) => res.send("Get clinic settings"));

router.patch("/:id/settings", (req, res) => res.send("Update clinic settings"));

export default router;
