import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const decodeJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.decode(token);
            req.user = decoded;
        } catch (error) {
            return res.status(401).json({
                error: {
                    message: 'Invalid JWT token provided',
                    details: error
                }
            });
        }
    }

    next();
};

export default decodeJWT;