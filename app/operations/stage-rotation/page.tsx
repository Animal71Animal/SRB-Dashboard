"use client";

import { useEffect } from "react";

// This route is no longer used. The Stage Rotation popup is launched
// directly from the Sidebar with the correct ?venue= parameter.
// Redirect any direct visitors back to the overview.
export default function StageRotationPage() {
  useEffect(() => {
    window.location.replace("/");
  }, []);
  return null;
}
