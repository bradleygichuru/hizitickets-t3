import { useState } from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import type { SubmitHandler} from "react-hook-form";
import { useForm } from "react-hook-form";
import type { NextPage } from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import Layout from "../../components/layout";
import {useRouter} from "next/router";
import {
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
} from "@chakra-ui/react";
import Image from "next/image";

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
  const Router = useRouter()
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buyMutation = trpc.ticket.buyTicket.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formSchema>();

  const { data, isFetched } = trpc.events.getEvent.useQuery({
    eventName: Router?.query?.slug?.[0] as string,
  });
  const onSubmit: SubmitHandler<formSchema> = async (formData) => {
    const searchObj = data?.event?.ticketTypes?.find(
      (type) => type.title == formData.ticketTypeTitle
    );
    setIsSubmitting(true);
    if (searchObj?.price) {
      buyMutation.mutateAsync(
        {
          mobileNumber: formData.mobileNumber,
          quantity: formData.quantity,
          ticketTypeTitle: formData.ticketTypeTitle,
          eventName: data?.event?.EventName as string,
          totalAmount: searchObj?.price * formData.quantity,
        },
        {
          onSuccess(data) {
            setIsSubmitting(false);
            if (data.transcation) {
              Router.push(`/transaction/${data.transcation.MerchantRequestID}`);
            } else {
              toast({
                title: "Error",
                description: "There was a problem purchasing your tickets",
                status: "error",
                duration: 9000,
                isClosable: true,
              });
            }
          },
        }
      );
    }

    console.log(formData);
  };

  //TODO handle errors

  console.log(Router?.query.slug);
  console.log({ data });

  return (
    <Layout>
      <Skeleton isLoaded={isFetched} className="w-screen h-screen z-0">
        <div className=" sm:m-4 sm:ml-20 ">
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>We currently only support mpesa payments.</AlertTitle>
            <AlertDescription>
              We are working on adding other payment methods soon.
            </AlertDescription>
          </Alert>{" "}
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-y-16 gap-x-8 px-6 sm:px-6 sm:py-6 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8 ">
              <div className="card w-96 bg-base-100 shadow-xl">
                <figure>
                  <Image
                    width={384}
                    height={100}
                    src={data?.event?.EventPosterUrl as string}
                    alt={data?.event?.EventName as string}
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{data?.event?.EventName}</h2>
                </div>
              </div>
            </div>
            <div className="relative grid grid-cols-1 gap-4  sm:gap-6 lg:grid-cols-2 lg:gap-8 ">
              <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
                <label className="label">
                  <span className="label-text">select ticket type</span>
                </label>
                <select
                  {...register("ticketTypeTitle", { required: true })}
                  className="select-bordered select "
                >
                  {data?.event?.ticketTypes.map((val, index) => (
                    <option key={index} value={val.title}>
                      {`${val?.title} ${val?.price} ksh`}
                    </option>
                  ))}
                </select>
                <label className="label">
                  {errors.ticketTypeTitle && (
                    <span className="label-text-alt text-red-600">
                      {errors.ticketTypeTitle.message}
                    </span>
                  )}
                </label>

                <label className="label">
                  <span className="label-text">select quantity of tickets</span>
                </label>
                <select
                  {...register("quantity", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  className="select-bordered select "
                >
                  {data?.quantity?.map((val, index) => {
                    return (
                      <option key={index} value={val}>
                        {val}
                      </option>
                    );
                  })}
                </select>
                <label className="label">
                  {errors.quantity && (
                    <span className="label-text-alt text-red-600">
                      {errors.quantity.message}
                    </span>
                  )}
                </label>

                <label className="label">
                  <span className="label-text">Your mpesa number</span>
                </label>
                <label className="input-group">
                  <span>+254</span>

                  <input
                    type="tel"
                    placeholder="71234567"
                    {...register("mobileNumber", {
                      required: "phone number is required",
                      valueAsNumber: true,
                      minLength: 9,
                      maxLength: 9,
                    })}
                    className="input-bordered input"
                  />
                </label>
                <label className="label">
                  {errors.mobileNumber && (
                    <span className="label-text-alt text-red-600">
                      {errors.mobileNumber.message}
                    </span>
                  )}
                </label>

                <button
                  className={
                    isSubmitting
                      ? "btn-disabled loading btn gap-2 rounded"
                      : "btn-accent btn gap-2 rounded"
                  }
                  disabled={isSubmitting ? true : false}
                  type="submit"
                >
                  <FaMoneyCheckAlt />
                  checkout
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
                Event Description
              </h2>
              <p className="mt-4 text-base-content">
                {data?.event?.EventDescription}
              </p>

              <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
                <div
                    className="border-t border-gray-200 pt-0"
                  >
                    <dt className="font-medium text-base-content">
                      Time
                    </dt>
                    <dd className="mb-20 text-sm text-base-content">
                      {data?.event?.EventDate.toDateString()}
                    </dd>
                  </div>

              </dl>
            </div>
          </div>
        </div>
      </Skeleton>
    </Layout>
  );
};
export default Ticket;
