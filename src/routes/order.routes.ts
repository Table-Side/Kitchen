import { Router } from "express";

const router = Router();

router.get("/queued", async (req, res) => {
    // Get the retaurant's queued orders (orders that have been paid but are not currently/were made)
});

router.get("/in-progress", async (req, res) => {
    // Get the retaurant's in progress orders (orders that are in progress)
});

router.get("/complete", async (req, res) => {
    // Get the retaurant's completed orders (orders that are finished)
});

router.post("/orders/receieve", async (req, res) => {
    // Receive a new order from the order microservice
});

router.get("/details/:orderId", async (req, res) => {
    // Get the details of a specific order
});

router.put("/accept/:orderId", async (req, res) => {
    // Accept a new order
});

router.put("/cancel/:orderId", async (req, res) => {
    // Reject a new order or cancel an accepted order
});

router.put("/complete/:orderId", async (req, res) => {
    // Complete an accepted order
});

export default router;
