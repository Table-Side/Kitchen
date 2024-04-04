import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces';
import prisma from '../config/prisma';

const orderExists = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        }
    });

    if (!order) {
        res.status(404).json({
            error: {
                message: "Order not found"
            }
        });
        return;
    }
    
    next();
}

export default orderExists;