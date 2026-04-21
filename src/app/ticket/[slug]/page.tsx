"use client";

import React, { useState, useEffect } from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Layout from "@/components/layout";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Calendar, HandCoins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type formSchema = {
  quantity: number;
  mobileNumber: string;
  ticketTypeTitle: string;
  email: string;
};

const TicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const eventName = params?.slug?.[0] as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{ paymentUrl?: string; transactionId?: string }>({});
  const [dots, setDots] = useState(".");
  
  const buyMutation = useMutation({
    mutationFn: (data: {
      mobileNumber: string;
      quantity: number;
      ticketTypeTitle: string;
      eventName: string;
      totalAmount: number;
      email: string;
    }) => api.post("/ticket/buyTicket", data).then((res) => res.data),
  });

  const checkTransactionMutation = useMutation({
    mutationFn: (data: { merchantRequestID: string }) =>
      api.post("/transaction/checkTransaction", data).then((res) => res.data),
  });
  
  useEffect(() => {
    if (!showPaymentModal || !paymentModalData.transactionId) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + "." : ".");
      
      checkTransactionMutation.mutate({ merchantRequestID: paymentModalData.transactionId! });
    }, 6000);
    
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentModalData.transactionId]);

  useEffect(() => {
    const res = checkTransactionMutation.data;
    if (!res) return;
    

    if (res.completed === true) {
      toast.success("Payment Complete", {
        description: "Your tickets are being generated",
      });
      setShowPaymentModal(false);
      router.push(`/transaction/${paymentModalData.transactionId}`);
    }
    if (res.cancelled === true) {
      setShowPaymentModal(false);
      toast.error("Payment Failed", {
        description: "Please try again",
      });
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
  
  const { data, isPending: isLoading } = useQuery({
    queryKey: ["getEvent", eventName],
    queryFn: () =>
      api
        .get("/events/getEvent", { params: { eventName } })
        .then((res) => res.data),
  });

  const searchObj = data?.event?.ticketTypes?.find(
    (type: any) => type.title == vals.ticketTypeTitle
  );

  const onSubmit: SubmitHandler<formSchema> = async (formData, e) => {
    e?.preventDefault();
    setIsSubmitting(true);
  };

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
      <div className="w-screen h-screen z-0">
        <Alert className="m-3">
          <HandCoins className="h-4 w-4" />
          <AlertTitle>We currently only support PayGate payments</AlertTitle>
          <AlertDescription>
            Secure payment powered by Stripe.
          </AlertDescription>
        </Alert>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden shadow-lg">
              {data?.event?.EventPosterData ? (
                <img
                  src={data.event.EventPosterData}
                  alt={data?.event?.EventName as string}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <Image
                  width={384}
                  height={384}
                  quality={100}
                  src={data?.event?.EventPosterUrl as string}
                  alt={data?.event?.EventName as string}
                  className="w-full h-auto object-cover"
                />
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{data?.event?.EventName}</h1>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(data?.event?.EventDate).toDateString()}</span>
                </div>
              </div>

              <p className="text-muted-foreground">
                {data?.event?.EventDescription}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketType">Ticket Type</Label>
                  <Select
                    onValueChange={(e) => {
                      setValue("ticketTypeTitle", e);
                    }}
                  >
                    <SelectTrigger id="ticketType">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.event?.ticketTypes.map((val: any, index: number) => (
                        <SelectItem key={index} value={val.title}>
                          {`${val?.title} ${val?.price} ksh`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!vals.ticketTypeTitle && (
                    <p className="text-sm text-red-500">Please select a ticket type</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setValue(
                          "quantity",
                          Math.max(getValues("quantity") - 1, 1)
                        )
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      id="quantity"
                      defaultValue={1}
                      {...register("quantity", { valueAsNumber: true })}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setValue("quantity", getValues("quantity") + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="254700000000"
                    {...register("mobileNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email")}
                  />
                </div>

                {searchObj && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-semibold">
                      Total: KES {searchObj.price * (vals.quantity || 0)}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Tickets"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Processing Payment</DialogTitle>
              <DialogDescription>
                Please wait while we process your payment{dots}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TicketPage;