import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "sonner";
import * as serviceWorkerRegistration from "@/serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Toaster position="top-right" theme="dark" richColors />
    <App />
  </React.StrictMode>,
);

serviceWorkerRegistration.register();
