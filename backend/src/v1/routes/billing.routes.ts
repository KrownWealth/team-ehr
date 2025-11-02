import { Router } from "express";
import {
  createBill,
  getBillById,
  updateBill,
  recordPayment,
  getAllPayments,
  getRevenueReport,
  getOutstandingBalances,
} from "../../controllers/billing.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { tenantIsolation } from "../../middleware/tenant.middleware";

const router = Router();
router.use(authenticate);
router.use(tenantIsolation);

// Bill Management
router.post("/bills", authorize(["ADMIN", "CASHIER"]), createBill);
router.get("/bills/:id", getBillById);
router.put("/bills/:id", authorize(["ADMIN", "CASHIER"]), updateBill);

// Payment Management
router.post("/payments", authorize(["CASHIER"]), recordPayment);
router.get("/payments", getAllPayments);

router.get(
  "/reports/revenue",
  authorize(["ADMIN", "CASHIER"]),
  getRevenueReport
);
router.get(
  "/outstanding",
  authorize(["ADMIN", "CASHIER"]),
  getOutstandingBalances
);

export default router;
