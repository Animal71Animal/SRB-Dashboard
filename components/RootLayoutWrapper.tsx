"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import type { Role } from "@/lib/auth/roles";
import VenueSwitcher from "@/components/VenueSwitcher";

export default function RootLayoutWrapper() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("srb-user-role") as Role;
    setRole(saved || "SuperAdmin"); // Default to SuperAdmin for now
  }, []);

  const changeRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem("srb-user-role", newRole);
    window.location.reload(); // Hard reload to reset all module states & permissions
  };

  return (
    <>
      <VenueSwitcher />
      <Sidebar />
      <div style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 300,
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "8px 12px", display: "flex", gap: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)", alignItems: "center"
      }}>
        <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Role: {role}</span>
        <select
          value={role || ""}
          onChange={(e) => changeRole(e.target.value as Role)}
          style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            color: "var(--text)", borderRadius: 6, padding: "4px 8px",
            fontSize: "0.8rem", outline: "none", cursor: "pointer"
          }}
        >
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="Manager">Manager</option>
          <option value="DJ">DJ</option>
          <option value="Employee">Employee</option>
        </select>
      </div>
    </>
  );
}
