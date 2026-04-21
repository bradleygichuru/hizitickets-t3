"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Layout from "@/components/layout";
import Section from "@/components/section";
import Image from "next/image";
import ticket from "@/../public/ticket-svgrepo-com.svg";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const { data, isPending: isLoading } = useQuery({
    queryKey: ["getVerifiedEvents"],
    queryFn: () => api.get("/events/getVerifiedEvents").then((res) => res.data),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Skeleton className="h-[200px] w-[200px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {data?.events?.length === 0 ? (
        <div className="grid h-screen place-items-center bg-base-100 text-xl m-10 text-base-content">
          <Image src={ticket} width={200} height={200} alt="ticket" />
          <p className="font-extrabold">No Events</p>
        </div>
      ) : (
        <Section sectionName="Section" data={data?.events} />
      )}
    </Layout>
  );
}