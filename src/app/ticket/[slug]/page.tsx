"use client";

import React, { useState, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Layout from "@/components/layout";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Ticket, Loader2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type formSchema = {
  quantity: number;
  mobileNumber: string;
  ticketTypeTitle: string;
  email: string;
};

const TicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const eventName = decodeURIComponent(params?.slug as string);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{ paymentUrl?: string; transactionId?: string; merchantRequestID?: string }>({});
  const [dots, setDots] = useState(".");
  const [canCheckPayment, setCanCheckPayment] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "checking" | "confirmed" | "cancelled">("waiting");
  
  const buyMutation = useMutation({
    mutationFn: (data: {
      mobileNumber: string;
      quantity: number;
      ticketTypeTitle: string;
      eventName: string;
      totalAmount: number;
      email: string;
    }) => api.post("/ticket/buyTicket", data).then((res) => res.data),
    onSuccess: (data) => {
      setIsSubmitting(false);
      setPaymentStatus("waiting");
      if (data?.paymentUrl) {
        window.open(data.paymentUrl, "_blank");
      }
      setPaymentModalData({
        paymentUrl: data?.paymentUrl,
        transactionId: data?.transactionId,
        merchantRequestID: data?.merchantRequestID,
      });
      setShowPaymentModal(true);
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast.error("Purchase failed", { description: (err as Error).message });
    },
  });

  const checkTransactionMutation = useMutation({
    mutationFn: (data: { merchantRequestID: string }) =>
      api.post("/transaction/checkTransaction", data).then((res) => res.data),
    onSuccess: () => setPaymentStatus("waiting"),
    onSettled: () => setPaymentStatus("waiting"),
  });

  const cancelMutation = useMutation({
    mutationFn: (data: { merchantRequestID: string }) =>
      api.post("/transaction/cancelTransaction", data).then((res) => res.data),
    onSuccess: () => {
      toast.info("Payment cancelled");
      setShowPaymentModal(false);
    },
    onError: () => {
      toast.error("Failed to cancel payment");
    },
  });
  
  useEffect(() => {
    if (!showPaymentModal || !paymentModalData.merchantRequestID) return;
    
    const interval = setInterval(() => {
      if (paymentStatus !== "confirmed") {
        setDots(prev => prev.length < 3 ? prev + "." : ".");
        setPaymentStatus("checking");
        checkTransactionMutation.mutate({ merchantRequestID: paymentModalData.merchantRequestID! });
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentModalData.merchantRequestID]);

  useEffect(() => {
    const res = checkTransactionMutation.data;
    if (!res) return;

    if (res.completed === true) {
      setPaymentStatus("confirmed");
    }
    if (res.cancelled === true) {
      setPaymentStatus("cancelled");
      toast.error("Payment Failed", { description: "Please try again" });
    }
  }, [checkTransactionMutation.data]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<formSchema>();
  const vals = watch();
  
  const { data, isPending: isLoading, isError, error } = useQuery({
    queryKey: ["getEvent", eventName],
    queryFn: async () => {
      const res = await api.get("/events/getEvent", { params: { eventName } });
      if (res.status >= 400) {
        throw new Error(res.data?.result ?? "Failed to load event");
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const searchObj = data?.event?.ticketTypes?.find(
    (type: any) => type.title == vals.ticketTypeTitle
  );

  const onSubmit: SubmitHandler<formSchema> = async (formData, e) => {
    e?.preventDefault();

    if (!formData.ticketTypeTitle) {
      toast.error("Please select a ticket type");
      return;
    }

    if (!formData.mobileNumber || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!searchObj) {
      toast.error("Invalid ticket type selected");
      return;
    }

    const totalAmount = searchObj.price * formData.quantity;

    buyMutation.mutate({
      mobileNumber: formData.mobileNumber,
      quantity: formData.quantity,
      ticketTypeTitle: formData.ticketTypeTitle,
      eventName: eventName,
      totalAmount,
      email: formData.email,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading event...</p>
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
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Event</h2>
            <p className="text-muted-foreground mb-6">
              {(error as Error)?.message ?? "Event not found"}
            </p>
            <Button 
              onClick={() => router.push("/events")}
              className="bg-primary hover:bg-primary/90"
            >
              Browse Events
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const posterImage = data?.event?.EventPosterData 
    ? data.event.EventPosterData 
    : data?.event?.EventPosterUrl;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          {posterImage ? (
            posterImage.startsWith("data:image") ? (
              <img
                src={posterImage}
                alt={data?.event?.EventName as string}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={posterImage as string}
                alt={data?.event?.EventName as string}
                fill
                className="object-cover"
                priority
              />
            )
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Ticket className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {data?.event?.EventName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/90">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(data?.event?.EventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              {data?.event?.EventLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {data.event.EventLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Description */}
          {data?.event?.EventDescription && (
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed">
                {data.event.EventDescription}
              </p>
            </div>
          )}

          {/* Ticket Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Tickets</h2>
              <div className="grid gap-3">
                {data?.event?.ticketTypes.map((type: any) => (
                  <label
                    key={type.id}
                    className={`
                      relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer 
                      transition-all duration-200
                      ${vals.ticketTypeTitle === type.title 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                    `}
                  >
                    <input
                      type="radio"
                      value={type.title}
                      {...register("ticketTypeTitle")}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${vals.ticketTypeTitle === type.title ? 'border-primary' : 'border-muted-foreground'}
                      `}>
                        {vals.ticketTypeTitle === type.title && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="font-medium">{type.title}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      KES {type.price}
                    </span>
                  </label>
                ))}
              </div>
              {!vals.ticketTypeTitle && (
                <p className="text-sm text-destructive mt-2">Please select a ticket type</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quantity</h2>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setValue("quantity", Math.max((getValues("quantity") || 1) - 1, 1))
                  }
                  className="h-10 w-10"
                >
                  -
                </Button>
                <Input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  defaultValue={1}
                  className="w-20 text-center h-10 text-lg font-medium"
                  onChange={(e) => setValue("quantity", parseInt(e.target.value) || 1)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue("quantity", (getValues("quantity") || 1) + 1)}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="border-t border-border my-6" />

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="254700000000"
                    {...register("mobileNumber")}
                    className="mt-1.5 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email")}
                    className="mt-1.5 h-10"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border my-6" />

            {/* Total & CTA */}
            <div className="space-y-4">
              {searchObj && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      KES {searchObj.price * (vals.quantity || 1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vals.quantity || 1} × {searchObj.title}
                  </p>
                </div>
              )}

              <Button
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || buyMutation.isPending}
              >
                {isSubmitting || buyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-5 w-5" />
                    Buy Tickets
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-background p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border animate-in fade-in zoom-in-95 duration-200">
              {paymentStatus === "confirmed" ? (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">
                    Payment Confirmed!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your tickets are being generated.
                  </p>
                  <Button
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setShowPaymentModal(false);
                      router.push(`/transaction/${paymentModalData.transactionId}`);
                    }}
                  >
                    View Tickets
                  </Button>
                </div>
              ) : paymentStatus === "cancelled" ? (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Payment Failed
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    The payment was not completed. Please try again.
                  </p>
                  <Button
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentStatus("waiting");
                    }}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    {paymentStatus === "checking" ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Ticket className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Complete Your Payment</h2>
                      </>
                    )}
                    <p className="text-muted-foreground mt-2">
                      {paymentStatus === "checking" 
                        ? "Please wait while we verify your payment" 
                        : `Open the payment page to complete your purchase${dots}`}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {paymentModalData.paymentUrl && (
                      <Button
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          window.open(paymentModalData.paymentUrl, "_blank");
                        }}
                      >
                        Open Payment Page
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      className="w-full h-11"
                      onClick={() => {
                        if (!canCheckPayment) {
                          toast.error("Please wait before checking again");
                          return;
                        }
                        setCanCheckPayment(false);
                        setTimeout(() => setCanCheckPayment(true), 10000);
                        if (paymentModalData.merchantRequestID) {
                          setPaymentStatus("checking");
                          checkTransactionMutation.mutate({
                            merchantRequestID: paymentModalData.merchantRequestID,
                          });
                        }
                      }}
                      disabled={checkTransactionMutation.isPending || !canCheckPayment}
                    >
                      {checkTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "I've Completed Payment"
                      )}
                    </Button>
                    {!canCheckPayment && (
                      <p className="text-xs text-center text-muted-foreground">
                        You can check again in a few seconds
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full h-10 text-muted-foreground"
                      onClick={() => {
                        if (paymentModalData.merchantRequestID) {
                          cancelMutation.mutate({
                            merchantRequestID: paymentModalData.merchantRequestID,
                          });
                        }
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketPage;
