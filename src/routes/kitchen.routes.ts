import { Router, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import prisma from "../config/prisma";
import { isAuthenticated, hasRole, orderExists } from "../middleware";
import { Order, Status } from "@prisma/client";

const router = Router();

router.get("/:restaurantId/orders/:status", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    // Get the retaurant's queued orders (orders that have been paid but are not currently being made)
    try {
        const { restaurantId } = req.params;

        // Filter out orders that are not pending and sort by time
        const status = () => {
            switch (req.params.status) {
                case "pending":
                    return "PENDING";
                case "in-progress":
                    return "IN_PROGRESS";
                case "completed":
                    return "COMPLETED";
                case "rejected":
                    return "REJECTED";
                default:
                    return null;
            }
        };
        if (!status) {
            res.status(400).json({
                error: {
                    message: "Invalid status"
                }
            });
            return;
        }

        // Fetch all orders, including the status updates
        let orders = await prisma.order.findMany({
            where: {
                restaurantId,
            },
            include: {
                status: true,
            },
        });

        if (!orders) {
            res.status(404).json({
                error: {
                    message: "No orders found"
                }
            });
            return;
        }

        if (!status) {
            // Filter orders by desired status
            
        }

        // Sort orders by recency
        orders = orders.sort((a: Order, b: Order) => parseInt((a.createdAt.getTime() / 1000).toFixed(0)) - parseInt((b.createdAt.getTime() / 1000).toFixed(0)));

        res.status(200).json({
            data: orders
        })
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to get pending orders",
                details: error
            }
        });
    }
});

router.get("/:orderId/details", orderExists, async (req: AuthenticatedRequest, res: Response) => {
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

router.put("/:orderId/status/update/:newStatus", isAuthenticated, hasRole("restaurant"), orderExists, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.params;

        // Determine the new status
        let newStatus: Status = null;
        switch (req.params.newStatus) {
            case "accept":
                newStatus = Status.IN_PROGRESS; // Order is being made
                break;
            case "complete":
                newStatus = Status.COMPLETED; // Order is ready to be taken to customer/fulfilled
                break;
            case "cancel":
                newStatus = Status.CANCELLED; // Order is cancelled after being accepted
                break;
            case "reject":
                newStatus = Status.REJECTED; // Order cannot be accepted
                break;
        };
        if (!newStatus) {
            res.status(400).json({
                error: {
                    message: "Invalid status",
                    details: "Valid statuses are 'accept', 'complete', 'cancel', 'reject'."
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
