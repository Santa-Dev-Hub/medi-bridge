import {
  getFoodInfo,
  calculateHealthScore,
  checkDietaryCompatibility,
} from "../utils/api.js";

// ✅ 1️⃣ Get Food Info (by name or barcode)
export const fetchFoodInfo = async (req, res) => {
  try {
    const { foodName, barcode } = req.query;

    const result = await getFoodInfo(foodName, barcode);
    res.status(200).json({
      success: true,
      message: "Food information fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2️⃣ Calculate Health Score
export const getHealthScore = async (req, res) => {
  try {
    const { foodName, barcode, age, height, weight } = req.query;

    if (!age || !height || !weight) {
      return res.status(400).json({ message: "age, height, and weight are required" });
    }

    const result = await calculateHealthScore(
      { age: Number(age), height: Number(height), weight: Number(weight) },
      foodName,
      barcode
    );

    res.status(200).json({
      success: true,
      message: "Health score calculated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3️⃣ Check Dietary Compatibility
export const getDietaryCheck = async (req, res) => {
  try {
    const { foodName, barcode, dietType } = req.query;

    const result = await checkDietaryCompatibility(foodName, barcode, dietType);

    res.status(200).json({
      success: true,
      message: "Dietary compatibility check completed",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
