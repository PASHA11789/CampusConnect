/**
 * Extracts vendor initials programmatically from a restaurant name.
 * e.g., "Johnny & Jugnu" -> "JJ"
 * "Savour Foods" -> "SF"
 */
export const getVendorInitials = (restaurantName) => {
  if (!restaurantName || typeof restaurantName !== "string") {
    return "XX";
  }
  // Replace non-alphanumeric characters with spaces
  const cleaned = restaurantName.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "XX";
  
  const initials = words.map((word) => word[0].toUpperCase()).join("");
  return initials || "XX";
};

/**
 * Generates a custom Order ID in the format: ODR-[Random 5 Digits]-[Vendor Initials]
 * e.g., ODR-58492-JJ
 */
export const generateOrderId = (restaurantName) => {
  const random5Digits = Math.floor(10000 + Math.random() * 90000).toString();
  const initials = getVendorInitials(restaurantName);
  return `ODR-${random5Digits}-${initials}`;
};
