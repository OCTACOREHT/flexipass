"use client";

import React from "react";
import Sidebar from "@/app/admiflexipass/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f23] text-zinc-200 antialiased flex">
      {/* Sidebar - Fixed width when expanded, icon width when collapsed */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-300 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
