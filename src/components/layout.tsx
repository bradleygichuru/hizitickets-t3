import React from "react";
import Nav from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}
