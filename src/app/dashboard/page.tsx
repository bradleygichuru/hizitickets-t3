"use client";

import { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import ReactLoading from "react-loading";
import Layout from "@/components/layout";
import { SubmitHandler, useForm } from "react-hook-form";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "@/server/firebaseConfig";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { z } from "zod";
import Image from "next/image";
import ticketLogo from "@/../public/ticket-svgrepo-com.svg";
import { authClient } from "@/components/providers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FormSchema = z.object({
  mobileContact: z.string().min(1, "Mobile contact is required"),
  eventName: z.string().min(1, "Event name is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTicketPrice: z.number(),
  eventMaxTickets: z.number().min(1),
  eventPoster: z.any(),
  ticketType1Name: z.string().min(1),
  ticketType1Price: z.number(),
  ticketType1Date: z.string(),
  ticketType2Name: z.string().optional(),
  ticketType2Price: z.number().optional(),
  ticketType2Date: z.string().optional(),
  ticketType3Name: z.string().optional(),
  ticketType3Price: z.number().optional(),
  ticketType3Date: z.string().optional(),
  ticketType4Name: z.string().optional(),
  ticketType4Price: z.number().optional(),
  ticketType4Date: z.string().optional(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

const Dashboard = () => {
  const { data: session, isPending: status } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchemaType>();

  const { data, isLoading } = useQuery({
    queryKey: ["getUserEvents", session?.user?.name],
    queryFn: () =>
      api
        .get("/events/getUserEvents", {
          params: { eventOrganizer: session?.user?.name },
        })
        .then((res) => res.data),
    enabled: !!session?.user?.name,
  });

  const addEventMutation = useMutation({
    mutationFn: (data: any) =>
      api.post("/events/addEvent", data).then((res) => res.data),
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await addEventMutation.mutateAsync(formData);
      
      if (result.result === "success") {
        toast.success("Success", {
          description: "Your event was submitted successfully",
        });
        setIsModalOpen(false);
        reset();
      } else {
        toast.error("Error", {
          description: result.result || "Failed to create event",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

if (status) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <span className="text-muted-foreground">Authenticating...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-xl font-semibold">Sign in Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access your dashboard and manage your events.
            </p>
            <Button 
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
              className="bg-primary hover:bg-primary/90"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <BiAddToQueue className="mr-2 h-5 w-5" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event Name *</Label>
                    <Input
                      id="eventName"
                      {...register("eventName", { required: true })}
                    />
                    {errors.eventName && (
                      <p className="text-sm text-red-500">Required</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileContact">Mobile Contact *</Label>
                    <Input
                      id="mobileContact"
                      {...register("mobileContact", { required: true })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventDescription">Event Description *</Label>
                    <Textarea
                      id="eventDescription"
                      {...register("eventDescription", { required: true })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventLocation">Event Location *</Label>
                    <Input
                      id="eventLocation"
                      {...register("eventLocation", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      {...register("eventDate", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventMaxTickets">Max Tickets *</Label>
                    <Input
                      id="eventMaxTickets"
                      type="number"
                      {...register("eventMaxTickets", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Ticket Type 1</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input {...register("ticketType1Name")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (KES)</Label>
                      <Input type="number" {...register("ticketType1Price", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input type="datetime-local" {...register("ticketType1Date")} />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {data?.events?.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Image src={ticketLogo} width={100} height={100} alt="ticket" />
              <p className="mt-4 text-lg font-semibold">No Events Yet</p>
              <p className="text-muted-foreground">
                Create your first event to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.events?.map((event: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {event.EventName}
                      </TableCell>
                      <TableCell>
                        {new Date(event.EventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{event.EventLocation}</TableCell>
                      <TableCell>
                        {event.EventValidity ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.EventMaxTickets - (event.ticketsSold || 0)} / {event.EventMaxTickets}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;