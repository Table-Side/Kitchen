import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { OrderedItem } from "@prisma/client";

const router = Router();

router.post("/orders/:restaurantId/receive", async (req: Request, res: Response) => {
    // Receive a new order from the order microservice
    try {
        const { restaurantId } = req.params;
        const { orderId, userId, items } = req.body;
        
        // Fetch details of items
        const itemIds = items.map((item: {itemId: string, quantity: number}) => item.itemId);
        const itemDetailsReq = await fetch(`http://${process.env.RESTAURANT_SERVICE_URL ?? 'restaurant:3000'}/internal/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Request-From": "tableside-kitchen"
            },
            body: JSON.stringify({ itemIds: itemIds }),
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
                    message: "Kitchen order cannot be created"
                }
            });
        }

        // Create Kitchen Order Items
        const kitchenOrderedItemUpdates = itemDetails.map((item: { id: string, displayName: string, shortName: string }) => {
            // Find corresponding item in order
            const matchingOrderedItem = items.find((OrderedItem: { itemId: string, quantity: number }) => OrderedItem.itemId === item.id);

            return prisma.orderedItem.create({
                data: {
                    prettyName: item.displayName,
                    shortName: item.shortName,
                    quantity: matchingOrderedItem.quantity,
                    kitchenOrderId: kitchenOrder.id,
                }
            })
        });
        await prisma.$transaction(kitchenOrderedItemUpdates);

        // Add initial order status
        const initialOrderStatus = await prisma.orderStatus.create({
            data: {
                status: "IN_PROGRESS",
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
