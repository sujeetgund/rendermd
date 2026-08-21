"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registered: ", registration.scope);
          })
          .catch((err) => {
            console.log("ServiceWorker registration failed: ", err);
          });
      });

      const handleOnline = () => {
        toast.success("You are back online. All features synchronized.", {
          id: "network-status",
        });
      };

      const handleOffline = () => {
        toast.info("Offline mode active. Work is saved to local storage.", {
          id: "network-status",
          duration: 5000,
        });
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return null;
}
