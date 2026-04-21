"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/components/providers";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Image from "next/image";
import ticketLogo from "@/../public/ticket-svgrepo-com.svg";
import error from "@/../public/error.svg";
import EventInfo from "@/components/EventValidationEntry";


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["getEvents"],
    queryFn: () => api.get("/events/getEvents").then((res) => res.data),
  });

  useEffect(() => {
    if (!session) {
      authClient.signIn.social({ provider: "google", callbackURL: "/admin" });
    }
    setIsAuthenticated(!!session);
  }, [session]);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="text-foreground">
          {isAuthenticated === null ? "Authenticating..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (!session) {
    return <div className="grid h-screen place-items-center bg-base-100" />;
  }

  if (data?.events?.length === 0) {
    return (
      <div className="grid h-screen place-items-center bg-base-100 text-xl m-10 text-base-content">
        <Image src={ticketLogo} width={100} height={100} alt="ticket" />
        <p className="font-extrabold">No Events</p>
      </div>
    );
  }

  if (data?.events) {
    return (
      <div className="flex flex-row bg-base-100">
        {data?.events?.map((event: any, index: number) => (
          <EventInfo
            key={index}
            EventValidity={event?.EventValidity}
            EventName={event?.EventName}
            MobileContact={event?.MobileContact}
            EventOrganizer={event?.EventOrganizer}
          />
        ))}
      </div>
    );
  }

  if (data?.unauthorized) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <Image src={error} alt="error" width={100} height={100} />
        <span className="text-foreground">
          You are not authorized to view this page
        </span>
        <button
          className="btn-accent btn gap-2 rounded text-accent-content"
          onClick={() => authClient.signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return <div className="grid h-screen place-items-center bg-base-100" />;
}