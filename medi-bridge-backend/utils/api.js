import axios from "axios";

// 🔹 Get Food Info
export const getFoodInfo = async (foodName, barcode) => {
  if (!foodName && !barcode) {
    throw new Error("Either provide the food name or barcode");
  }

  const filterEnglishTags = (input) => {
    if (!input) return [];
    let arr = Array.isArray(input)
      ? input
      : typeof input === "string"
      ? input.split(",")
      : [];

    return arr
      .map((tag) => tag.trim())
      .filter((tag) => tag.startsWith("en:"))
      .map((tag) => tag.substring(3)); // remove 'en:' prefix
  };

  try {
    const response = barcode
      ? await axios.get(`https://en.openfoodfacts.net/api/v2/product/${barcode}.json`)
      : await axios.get(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1`
        );

    const data = response.data;
    const product = barcode ? data.product : data.products[0];

    if (!product) throw new Error("No product found");

    return {
      name: product.product_name || "Unknown",
      ingredients: product.ingredients_text || "Not available",
      nutrition: product.nutriments || {},
      barcode: product.code || "Not available",
      image: product.image_url || "No image available",
      allergens: filterEnglishTags(product.allergens_tags || product.allergens),
      categories: filterEnglishTags(product.categories_tags || product.categories),
      brands: product.brands || "Not available",
      labels: filterEnglishTags(product.labels_tags || product.labels),
      quantity: product.quantity || "Not available",
    };
  } catch (error) {
    throw new Error(error.message || "Error while fetching food information");
  }
};

// 🔹 Calculate Health Score
export const calculateHealthScore = async (userMetrics, foodName, barcode) => {
  if (!foodName && !barcode) {
    throw new Error("Provide either foodName or barcode as query parameter");
  }

  const foodInfo = await getFoodInfo(foodName, barcode);

  const heightInMeters = userMetrics.height / 100;
  const bmi = userMetrics.weight / (heightInMeters * heightInMeters);

  const nutriments = foodInfo.nutrition || {};
  const fat = nutriments["fat_100g"] ?? 0;
  const saturatedFat = nutriments["saturated-fat_100g"] ?? 0;
  const sugars = nutriments["sugars_100g"] ?? 0;
  const fiber = nutriments["fiber_100g"] ?? 0;
  const proteins = nutriments["proteins_100g"] ?? 0;
  const salt = nutriments["salt_100g"] ?? 0;

  let score = 100;

  if (bmi < 18.5) score -= 10;
  else if (bmi > 25) score -= 10;

  if (fat > 20) score -= 10;
  if (saturatedFat > 10) score -= 10;
  if (sugars > 15) score -= 10;
  if (fiber < 3) score -= 5;
  if (proteins < 5) score -= 5;
  if (salt > 1.5) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let grade = "E";
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";

  let advice = "";
  if (score >= 80) advice = "Good nutritional profile.";
  else if (score >= 60) advice = "Moderate nutritional content; watch fats and sugars.";
  else advice = "Poor nutritional content; consider healthier options.";

  return {
    score,
    grade,
    advice,
    bmi: parseFloat(bmi.toFixed(2)),
    foodName: foodInfo.name,
  };
};

// 🔹 Check Dietary Compatibility
export const checkDietaryCompatibility = async (foodName, barcode, dietType) => {
  if (!dietType) throw new Error("dietType is required (e.g., vegan, gluten-free)");
  if (!foodName && !barcode) throw new Error("Provide either foodName or barcode");

  const foodInfo = await getFoodInfo(foodName, barcode);

  const ingredientsText = (foodInfo.ingredients || "").toLowerCase();
  const allergens = (foodInfo.allergens || []).map((a) => a.toLowerCase());
  const labels = (foodInfo.labels || []).map((l) => l.toLowerCase());

  const dietExclusions = {
    vegan: ["milk", "egg", "meat", "honey", "gelatin", "cheese", "butter", "yogurt"],
    "gluten-free": ["wheat", "barley", "rye", "malt", "triticale"],
  };

  const exclusions = dietExclusions[dietType.toLowerCase()];
  if (!exclusions) {
    throw new Error(`Unsupported dietType: ${dietType}. Supported: vegan, gluten-free`);
  }

  const issues = [];
  exclusions.forEach((exclusion) => {
    if (
      ingredientsText.includes(exclusion) ||
      allergens.includes(exclusion) ||
      labels.includes(exclusion)
    ) {
      issues.push(exclusion);
    }
  });

  return {
    isCompatible: issues.length === 0,
    issues,
    dietType,
  };
};
