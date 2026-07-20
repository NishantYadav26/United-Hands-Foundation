import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "sonner";
import * as serviceWorkerRegistration from "@/serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Toaster position="top-center" theme="dark" richColors offset="16px" toastOptions={{ style: { zIndex: 2147483647 } }} />
    <App />
  </React.StrictMode>,
);

serviceWorkerRegistration.register();
