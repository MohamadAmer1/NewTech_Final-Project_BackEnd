export function normalizeLicensePlate(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[\s-]/g, "").toUpperCase();
}