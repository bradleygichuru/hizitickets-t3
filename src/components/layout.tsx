import React from "react";
import Nav from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        className="my-0 h-screen overflow-scroll bg-base-200"
        data-theme="corporate"
      >
        <Nav />
        {children}
      </main>
    </>
  );
}
