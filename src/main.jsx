import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./i18n"; // Import the i18n configuration
import {
  startEndOfDayTransfer,
  stopEndOfDayTransfer,
} from "./utils/viewCounter";

// Start end-of-day transfer scheduler once when the app boots in this tab
const stopTransfer = startEndOfDayTransfer();

// Ensure we stop scheduler when the page unloads
window.addEventListener("beforeunload", () => {
  if (typeof stopTransfer === "function") stopTransfer();
  try {
    stopEndOfDayTransfer();
  } catch (e) {}
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
