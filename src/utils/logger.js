/**
 * logger.js
 * ----------
 * Central logging utility.
 * Easy to disable logs in production later.
 */

export const logInfo = (message, data = null) => {
  console.log("[INFO]", message, data || "");
};

export const logError = (message, error = null) => {
  console.error("[ERROR]", message, error || "");
};

export const logDebug = (message, data = null) => {
  console.debug("[DEBUG]", message, data || "");
};
