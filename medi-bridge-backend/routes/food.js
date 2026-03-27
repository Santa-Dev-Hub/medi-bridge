import express from "express";
import {
  fetchFoodInfo,
  getHealthScore,
  getDietaryCheck,
} from "../controllers/foodController.js";

const router = express.Router();

// GET http://localhost:5000/api/v1/food/info?foodName=banana
// or GET http://localhost:5000/api/v1/food/info?barcode=1234567890
router.get("/info", fetchFoodInfo);

// GET http://localhost:5000/api/v1/food/health?foodName=banana&age=25&height=175&weight=70
router.get("/health", getHealthScore);

// GET http://localhost:5000/api/v1/food/diet?foodName=banana&dietType=vegan
router.get("/diet", getDietaryCheck);

export default router;
