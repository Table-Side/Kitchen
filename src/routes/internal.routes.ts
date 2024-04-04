import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { OrderItem } from "@prisma/client";

const router = Router();

router.post("/orders/:restaurantId/receive", async (req: Request, res: Response) => {
    // Receive a new order from the order microservice
    try {
        const { restaurantId } = req.params;
        const { orderId, userId, items } = req.body;
        
        // Fetch details of items
        const itemIds = items.map((item: {itemId: string, quantity: number}) => item.itemId);
        const itemDetailsReq = await fetch(`${process.env.RESTAURANT_SERVICE_URL}/internal/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Request-From": "tableside-kitchen"
            },
            body: JSON.stringify({ itemIds }),
        });
        const itemDetails = await itemDetailsReq.json();
        
        // Create Kitchen Order
        const kitchenOrder = await prisma.order.create({
            data: {
                orderId,
                restaurantId,
                userId,
            }
        });

        if (!kitchenOrder) {
            return res.status(500).json({
                error: {
                    message: "Order cannot be created"
                }
            });
        }

        // Create Kitchen Order Items
        const kitchenOrderItemUpdates = itemDetails.map((item: { id: string, displayName: string, shortName: string }) => {
            // Find corresponding item in order
            const matchingOrderItem = items.find((orderItem: { itemId: string, quantity: number }) => orderItem.itemId === item.id);

            return prisma.orderItem.create({
                data: {
                    prettyName: item.displayName,
                    shortName: item.shortName,
                    quantity: matchingOrderItem.quantity,
                    kitchenOrderId: kitchenOrder.id,
                }
            })
        });
        await prisma.$transaction(kitchenOrderItemUpdates);

        // Add initial order status
        const initialOrderStatus = await prisma.orderStatus.create({
            data: {
                status: "PENDING",
                kitchenOrderId: kitchenOrder.id,
            }
        });

        if (!initialOrderStatus) {
            return res.status(500).json({
                error: {
                    message: "Order status cannot be created"
                }
            });
        }

        // Get order details
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                status: true,
            },
        });

        return res.status(200).json({
            data: order
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to receive order",
                details: error
            }
        });
    }
});

export default router;
