import { Router, Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";

const router = Router();

router.get("/queued", async (req: AuthenticatedRequest, res: Response) => {
    // Get the retaurant's queued orders (orders that have been paid but are not currently/were made)
});

router.get("/in-progress", async (req: AuthenticatedRequest, res: Response) => {
    // Get the retaurant's in progress orders (orders that are in progress)
});

router.get("/complete", async (req: AuthenticatedRequest, res: Response) => {
    // Get the retaurant's completed orders (orders that are finished)
});

router.post("/orders/receieve", async (req: Request, res: Response) => {
    // Receive a new order from the order microservice
});

router.get("/details/:orderId", async (req: AuthenticatedRequest, res: Response) => {
    // Get the details of a specific order
});

router.put("/accept/:orderId", async (req: AuthenticatedRequest, res: Response) => {
    // Accept a new order
});

router.put("/cancel/:orderId", async (req: AuthenticatedRequest, res: Response) => {
    // Reject a new order or cancel an accepted order
});

router.put("/complete/:orderId", async (req: AuthenticatedRequest, res: Response) => {
    // Complete an accepted order
});

export default router;
