const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");

router.get("/test", (req, res) => {
  res.send("Payments route working!");
});

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment
router.post("/verify", verifyPayment);

module.exports = router;