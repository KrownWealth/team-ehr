import { Router as TenantRouter } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import prisma from "../../config/database";
import logger from "../../utils/logger.utils";

const tenantRouter = TenantRouter();

tenantRouter.use(authenticate);
tenantRouter.use(authorize(["ADMIN"])); // In production, use SUPER_ADMIN role

tenantRouter.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.clinic.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        clinics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get tenants error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

tenantRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            consultations: true,
            bills: true,
          },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({
        status: "error",
        message: "Tenant not found",
      });
    }

    res.json({
      status: "success",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Get tenant error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

tenantRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by deactivating
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Tenant deactivated: ${id}`);

    res.json({
      status: "success",
      message: "Tenant deactivated successfully",
      data: clinic,
    });
  } catch (error: any) {
    logger.error("Delete tenant error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export const tenantRoutes = tenantRouter;
