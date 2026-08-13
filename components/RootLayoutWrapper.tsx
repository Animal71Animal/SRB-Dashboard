"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import type { Role } from "@/lib/auth/roles";
import VenueSwitcher from "@/components/VenueSwitcher";

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VenueSwitcher />
      <Sidebar />
      {children}
    </>
  );
}
