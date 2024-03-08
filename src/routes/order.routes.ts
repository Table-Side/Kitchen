import { Router } from "express";

const router = Router();

router.get("/:restaurantId", async (req, res) => {
    // Get the retaurant's active orders
});

router.post("/:restaurantId/receieve", async (req, res) => {
    // Receive a new order from the order microservice
});

router.get("/:restaurantId/details/:orderId", async (req, res) => {
    // Get the details of a specific order
});

router.put("/:restaurantId/accept/:orderId", async (req, res) => {
    // Accept a new order
});

router.put("/:restaurantId/cancel/:orderId", async (req, res) => {
    // Reject a new order or cancel an accepted order
});

router.put("/:restaurantId/complete/:orderId", async (req, res) => {
    // Complete an accepted order
});

export default router;
