import { useState } from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { NextPage } from "next";
import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useToast, Skeleton } from "@chakra-ui/react";
import Image from "next/image";
import { Calendar, Clock, HandCoins, Loader2 } from "lucide-react";
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
type formSchema = {
  quantity: number;
  mobileNumber: string;
  ticketTypeTitle: string;
  email: string;
};
const features = [
  {
    name: "Time",
  },
];

//TODO quantity will be reduced on ticket purchase

const Ticket: NextPage = () => {
  const Router = useRouter();
  const toast = useToast();
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
  
  // Polling for payment status
  React.useEffect(() => {
    if (!showPaymentModal || !paymentModalData.transactionId) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + "." : ".");
      
      checkTransactionMutation.mutate({ merchantRequestID: paymentModalData.transactionId! });
    }, 6000);
    
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentModalData.transactionId]);

  // Handle transaction check response
  React.useEffect(() => {
    const res = checkTransactionMutation.data;
    if (!res) return;
    
    if (res.completed === true) {
      toast({
        title: "Payment Complete",
        description: "Your tickets are being generated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setShowPaymentModal(false);
      Router.push(`/transaction/${paymentModalData.transactionId}`);
    }
    if (res.cancelled === true) {
      setShowPaymentModal(false);
      toast({
        title: "Payment Failed",
        description: "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
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
  const { data, isFetched } = useQuery({
    queryKey: ["getEvent", Router?.query?.slug?.[0]],
    queryFn: () =>
      api
        .get("/events/getEvent", { params: { eventName: Router?.query?.slug?.[0] } })
        .then((res) => res.data),
  });

  const searchObj = data?.event?.ticketTypes?.find(
    (type: any) => type.title == vals.ticketTypeTitle
  );
  console.log({ liveFormData: watch() });
  const onSubmit: SubmitHandler<formSchema> = async (formData, e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    console.log(formData);
  };

  //TODO handle errors

  console.log(Router?.query.slug);
  console.log({ data });

  return (
    <Layout>
      <Skeleton isLoaded={isFetched} className="w-screen h-screen z-0">
        <Alert className="m-3">
          <HandCoins className="h-4 w-4" />
          <AlertTitle>We currently only support PayGate payments</AlertTitle>
          <AlertDescription>
            Secure payment powered by Stripe.
          </AlertDescription>
        </Alert>{" "}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Poster Section */}
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

            {/* Event Details and Purchase Form Section */}
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
                      console.log(e);
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
                          Math.max(getValues("quantity") - 1)
                        )
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      id="quantity"
                      defaultValue={1}
                      {...register("quantity", {
                        required: "Quantity is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimum quantity is 1" },
                      })}
                      onChange={(e) =>
                        setValue(
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-20 text-center"
                      min="1"
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
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    {...register("mobileNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{9}$/,
                        message: "Phone must be 9 digits (e.g., 712345678)",
                      },
                    })}
                    type="tel"
                    placeholder="712345678"
                    maxLength={9}
                  />
                  {errors.mobileNumber && (
                    <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    {...register("email", {
                      required: "Email is required",
                    })}
                    type="email"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  disabled={!vals.ticketTypeTitle || !vals.quantity || !vals.mobileNumber || !vals.email || isSubmitting || buyMutation.isPending}
                  onClick={() => {
                    if (searchObj?.price) {
                      buyMutation.mutate(
                        {
                          mobileNumber: vals?.mobileNumber,
                          quantity: vals?.quantity,
                          ticketTypeTitle: vals?.ticketTypeTitle,
                          eventName: data?.event?.EventName as string,
                          totalAmount: searchObj?.price * vals?.quantity,
                          email: vals?.email,
                        },
                        {
                          onSuccess(data) {
                            console.log("buyTicket response:", data);
                            if (data.transaction) {
                              if (data.paymentUrl) {
                                console.log("Opening PayGate in new tab:", data.paymentUrl);
                                window.open(data.paymentUrl, "_blank");
                                setPaymentModalData({
                                  paymentUrl: data.paymentUrl,
                                  transactionId: data.transaction.MerchantRequestID,
                                });
                                setShowPaymentModal(true);
                                return;
                              }
                              Router.push(
                                `/transaction/${data.transaction.MerchantRequestID}`
                              );
                            } else {
                              setIsSubmitting(false);
                              toast({
                                title: "Error",
                                description: data?.error || "There was a problem purchasing your tickets",
                                status: "error",
                                duration: 9000,
                                isClosable: true,
                              });
                            }
                          },
                          onError(error: any) {
                            console.error("buyTicket error:", error);
                            setIsSubmitting(false);
                            toast({
                              title: "Error",
                              description: error?.message || "Failed to process purchase",
                              status: "error",
                              duration: 9000,
                              isClosable: true,
                            });
                          },
                        }
                      );
                    }
                  }}
                >
                  {buyMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    ""
                  )}
                  Purchase Tickets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Skeleton>

      {/* Blocking Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <h2 className="text-xl font-bold">Payment in Progress</h2>
              <p className="text-muted-foreground">
                Please complete your payment in the new tab{dots}
              </p>
              <p className="text-sm text-muted-foreground">
                Do not close this page until payment is complete.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.open(paymentModalData.paymentUrl, "_blank");
                  }}
                >
                  Open Payment Page Again
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setIsSubmitting(false);
                    toast({
                      title: "Payment Cancelled",
                      description: "You can try again anytime",
                      status: "info",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                >
                  Cancel & Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
export default Ticket;
