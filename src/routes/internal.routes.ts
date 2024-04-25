import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { OrderedItem } from "@prisma/client";

const router = Router({ mergeParams: true });

router.post("/orders/:restaurantId/receive", async (req: Request, res: Response) => {
    // Receive a new order from the order microservice
    try {
        const { restaurantId } = req.params;
        const { orderId, userId, items } = req.body;

        console.log(`Received order ${orderId}`);
        
        // Fetch details of items
        const itemIds = items.map((item: {itemId: string, quantity: number}) => item.itemId);
        const itemDetailsReq = await fetch(`http://${process.env.RESTAURANT_SERVICE_URL ?? 'restaurant:3000'}/internal/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Request-From": "tableside-kitchen"
            },
            body: JSON.stringify({ restaurantId: restaurantId, itemIds: itemIds }),
        });

        if (!itemDetailsReq.ok) {
            return res.status(500).json({
                error: {
                    message: "Failed to fetch item details"
                }
            });
        }

        const itemDetails = await itemDetailsReq.json();

        console.log(`Received item details for order ${orderId}`);
        
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

        console.log(`Created kitchen order ${kitchenOrder.id} for order ${orderId}`)

        // Create Kitchen Order Items
        const kitchenOrderedItemUpdates = itemDetails.data.map((item: any) => {
            // Find corresponding item in order
            const orderedItem = items.find((orderedItem: { itemId: string, quantity: number }) => orderedItem.itemId === item.id);

            return prisma.orderedItem.create({
                data: {
                    prettyName: item.displayName,
                    shortName: item.shortName,
                    quantity: orderedItem.quantity,
                    kitchenOrder: {
                        connect: {
                            id: kitchenOrder.id
                        }
                    }
                }
            })
        });
        await prisma.$transaction(kitchenOrderedItemUpdates);

        console.log(`Added ordered items to kitchen order ${kitchenOrder.id} for order ${orderId}`)

        // Get order details
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
            },
        });

        console.log(`Sent order details for order ${orderId}`)

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
