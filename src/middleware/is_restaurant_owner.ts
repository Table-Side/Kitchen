import { Response, RequestHandler, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces';
import hasRole from './has_role';
import isAuthenticated from './authenticated';

/**
 * Checks if the current user owns the restaurant.
 * 
 * First, checks that the user is authenticated, and then whether the user has a role.
 */
export const ownsRestaurant: RequestHandler[] = [
    isAuthenticated,
    hasRole("restaurant"),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const restaurantId = req.params.restaurantId;
        const userId = req.user.sub;
        
        const isOwner = await fetch(`http://${process.env.RESTAURANT_SERVICE_URL ?? 'restaurant:3000'}/internal/restaurant/${restaurantId}/isOwner?userId=${userId}`);

        if (!isOwner.ok) {
            return res.status(403).json({
                error: {
                    message: "Not the owner of the restaurant",
                    details: await isOwner.json()
                }
            });
        }

        next();
    }
];
``