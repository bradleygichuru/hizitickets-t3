import React from "react";
import Nav from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="my-0 h-screen overflow-scroll bg-card" data-theme="light">
        <Nav />
        {children}
      </main>
    </>
  );
}
