import { useState } from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { NextPage } from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import {
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
} from "@chakra-ui/react";
import Image from "next/image";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type formSchema = {
  quantity: number;
  mobileNumber: number;
  ticketTypeTitle: string;
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
  const buyMutation = trpc.ticket.buyTicket.useMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<formSchema>();
  const vals = watch();
  const { data, isFetched } = trpc.events.getEvent.useQuery({
    eventName: Router?.query?.slug?.[0] as string,
  });

  const searchObj = data?.event?.ticketTypes?.find(
    (type) => type.title == vals.ticketTypeTitle
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
        {" "}
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>We currently only support mpesa payments.</AlertTitle>
          <AlertDescription>
            We are working on adding other payment methods soon.
          </AlertDescription>
        </Alert>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Poster Section */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                width={384}
                height={100}
                src={data?.event?.EventPosterUrl as string}
                alt={data?.event?.EventName as string}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Event Details and Purchase Form Section */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{data?.event?.EventName}</h1>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{data?.event?.EventDate.toDateString()}</span>
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
                      {data?.event?.ticketTypes.map((val, index) => (
                        <SelectItem key={index} value={val.title}>
                          {`${val?.title} ${val?.price} ksh`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        required: true,

                        valueAsNumber: true,
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    {...register("mobileNumber", {
                      required: "phone number is required",
                      valueAsNumber: true,
                      minLength: 9,
                      maxLength: 9,
                    })}
                    type="tel"
                    placeholder="71234567"
                  />
                </div>

                <button
                  className={
                    buyMutation?.isLoading
                      ? "btn-disabled w-full loading btn gap-2 rounded"
                      : "btn-accent w-full btn gap-2 rounded"
                  }
                  onClick={() => {
                    if (searchObj?.price) {
                      buyMutation.mutateAsync(
                        {
                          mobileNumber: vals?.mobileNumber,
                          quantity: vals?.quantity,
                          ticketTypeTitle: vals?.ticketTypeTitle,
                          eventName: data?.event?.EventName as string,
                          totalAmount: searchObj?.price * vals?.quantity,
                        },
                        {
                          onSuccess(data) {
                            setIsSubmitting(false);
                            if (data.transaction) {
                              Router.push(
                                `/transaction/${data.transaction.MerchantRequestID}`
                              );
                            } else {
                              toast({
                                title: "Error",
                                description:
                                  "There was a problem purchasing your tickets",
                                status: "error",
                                duration: 9000,
                                isClosable: true,
                              });
                            }
                          },
                        }
                      );
                    }
                  }}
                  disabled={buyMutation?.isLoading ? true : false}
                >
                  {buyMutation?.isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    ""
                  )}
                  Purchase Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </Skeleton>
    </Layout>
  );
};
export default Ticket;
