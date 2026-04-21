"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import api from "@/utils/api";
import Layout from "@/components/layout";
import { Calendar, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getEventImage(event: any): string {
  if (event.EventPosterData) {
    return event.EventPosterData;
  }
  return event.EventPosterUrl || "";
}

function EventCard({ event }: { event: any }) {
  return (
    <div className="group relative bg-card rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 overflow-hidden border">
      <div className="aspect-[16/10] overflow-hidden">
        {getEventImage(event) ? (
          event.EventPosterData?.startsWith("data:image") ? (
            <img
              src={getEventImage(event)}
              alt={event.EventName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src={getEventImage(event)}
              alt={event.EventName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Ticket className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
          {event.EventName}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(event.EventDate).toLocaleDateString()}</span>
        </div>
        {event.EventLocation && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {event.EventLocation}
          </p>
        )}
        <Link 
          href={`/ticket/${event.EventName}`}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 rounded-md text-sm font-medium px-4 py-2"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-10 bg-muted rounded w-full mt-4" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["getVerifiedEvents"],
    queryFn: async ({ pageParam }) => {
      const res = await api.get("/events/getVerifiedEvents", {
        params: { cursor: pageParam },
      });
      if (res.status >= 400) {
        throw new Error(res.data?.result ?? "Failed to load events");
      }
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  if (isPending) {
    return (
      <Layout>
        <div className="py-8 px-4 md:px-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="bg-destructive/10 p-4 rounded-full inline-flex mb-4">
              <Ticket className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Events</h2>
            <p className="text-muted-foreground mb-6">
              {(error as Error)?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upcoming Events</h1>
          <p className="text-muted-foreground mt-1">
            {events.length > 0 
              ? `${events.length} event${events.length === 1 ? '' : 's'} available`
              : 'No events scheduled'}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Events Yet</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-sm">
              Check back later for upcoming events
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.EventId} event={event} />
              ))}
            </div>
            
            {hasNextPage && (
              <div ref={ref} className="flex justify-center mt-8">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more events...</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => fetchNextPage()}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Load More Events
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
