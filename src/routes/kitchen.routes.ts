import { Router, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import prisma from "../config/prisma";
import { ownsRestaurant, orderExists } from "../middleware";

const router = Router({ mergeParams: true });

router.get("/", ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Get the details of a specific order
    try {
        const { restaurantId } = req.params;

        const orders = await prisma.order.findMany({
            where: {
                restaurantId: restaurantId,
            },
            include: {
                items: true,
            },
        });

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

router.get("/:orderId", ownsRestaurant, orderExists, async (req: AuthenticatedRequest, res: Response) => {
    // Get the details of a specific order
    try {
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
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

router.put("/:orderId/finish", ownsRestaurant, orderExists, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.params;

        // Get new order details
        const order = await prisma.order.delete({
            where: {
                id: orderId,
            },
            include: {
                items: true,
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
