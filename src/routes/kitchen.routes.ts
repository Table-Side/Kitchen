import { Router, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import prisma from "../config/prisma";
import { isAuthenticated, hasRole, orderExists } from "../middleware";
import { Order, Status } from "@prisma/client";

const router = Router({ mergeParams: true });

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
    // Get the details of a specific order
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true,
                status: true,
            },
        });

        const status = () => {
            switch (req.query.status) {
                case "in-progress":
                    return "IN_PROGRESS";
                case "completed":
                    return "COMPLETED";
                case "cancelled":
                    return "CANCELLED";
                default:
                    return null;
            }
        };

        if (status) {
            orders.filter((order: any) => order.status.status === status);
        }

        res.status(200).json({
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to get order details",
                details: error
            }
        });
    
    }
});

router.get("/:orderId", orderExists, async (req: AuthenticatedRequest, res: Response) => {
    // Get the details of a specific order
    try {
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                status: true,
            },
        });

        if (!order) {
            res.status(404).json({
                error: {
                    message: "Order not found"
                }
            });
            return;
        }

        res.status(200).json({
            data: order
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to get order details",
                details: error
            }
        });
    
    }
});

router.put("/:orderId/:newStatus", isAuthenticated, hasRole("restaurant"), orderExists, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.params;

        // Determine the new status
        let newStatus: Status = null;
        switch (req.params.newStatus) {
            case "complete":
                newStatus = Status.COMPLETED; // Order is ready to be taken to customer/fulfilled
                break;
            case "cancel":
                newStatus = Status.CANCELLED; // Order is to be cancelled
                break;
        };
        if (!newStatus) {
            res.status(400).json({
                error: {
                    message: "Invalid status",
                    details: "Valid statuses are 'complete' or 'cancel'."
                }
            });
            return;
        }

        const newStatusUpdate = await prisma.orderStatus.create({
            data: {
                status: newStatus,
                kitchenOrderId: orderId,
            },
        });

        if (!newStatusUpdate) {
            res.status(500).json({
                error: {
                    message: "Failed to update order status"
                }
            });
            return;
        }

        // Get new order details
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                status: true,
            },
        });

        res.status(200).json({
            data: order
        }); 
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update order status",
                details: error
            }
        });
    }
});


export default router;
