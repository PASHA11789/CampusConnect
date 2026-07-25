/**
 * Extracts vendor initials programmatically from a restaurant name.
 * e.g., "Johnny & Jugnu" -> "JJ"
 * "Savour Foods" -> "SF"
 */
export const getVendorInitials = (restaurantName) => {
  if (!restaurantName || typeof restaurantName !== "string") {
    return "XX";
  }
  const nameLower = restaurantName.toLowerCase();
  if (nameLower.includes("johnny")) return "JJ";
  if (nameLower.includes("savour")) return "SF";
  if (nameLower.includes("gourmet")) return "GR";
  if (nameLower.includes("dogar")) return "DR";

  const cleaned = restaurantName.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "XX";
  
  const initials = words.map((word) => word[0].toUpperCase()).join("");
  return initials || "XX";
};

/**
 * Generates a custom Order ID in the format: ODR-[Random 4 Digits]-[Vendor Initials]
 * e.g., ODR-4566-JJ
 */
export const generateOrderId = (restaurantName) => {
  const random4Digits = Math.floor(1000 + Math.random() * 9000).toString();
  const initials = getVendorInitials(restaurantName);
  return `ODR-${random4Digits}-${initials}`;
};
