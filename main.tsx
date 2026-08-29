import React from "react";
import { createRoot } from "react-dom/client";

import Story from "./app/story";
import "./app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

createRoot(root).render(
  <React.StrictMode>
    <Story />
  </React.StrictMode>,
);
