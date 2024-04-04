import { Router, Request, Response } from "express";
import prisma from "../config/prisma";

const router = Router();

router.post("/orders/receive", async (req: Request, res: Response) => {
    // Receive a new order from the order microservice
    try {
        const { orderId, items } = req.body;
        
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
        const kitchenOrder = await prisma.kitchenOrder.create({
            data: {
                orderId
            }
        });

        if (!kitchenOrder) {
            return res.status(500).json({
                error: {
                    message: "Order cannot be created"
                }
            });
        }

        // Create Kitchen Order Item
        const kitchenOrderItem = itemDetails.map((item) => {
            
        })
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
