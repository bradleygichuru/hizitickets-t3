import {
  useEffect, useState
} from "react";

import { FaMoneyCheckAlt } from "react-icons/fa";

/* import generateQR from "../../lib/Base64UrlGenerator"; */
import { set, SubmitHandler, useForm } from "react-hook-form";
import { GetServerSideProps } from "next";
import React from "react";
import Quixote from "../../components/Ticket";
import { trpc } from "../../utils/trpc";
import Layout from "../../components/layout";
import { Transaction } from "@prisma/client";
import Router from "next/router";
import Image from "next/image";
import puff from '../../../public/puff.svg'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

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

const Ticket: React.FC<{ slug: string }> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buyMutation = trpc.useMutation("ticket.buyTicket");

  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm<formSchema>();

  const onSubmit: SubmitHandler<formSchema> = async (formData) => {
    const searchObj = data?.event!.ticketTypes.find(
      (type) => type.title == formData.ticketTypeTitle
    );
    setIsSubmitting(true);
    buyMutation
      .mutateAsync({
        mobileNumber: formData.mobileNumber,
        quantity: formData.quantity,
        ticketTypeTitle: formData.ticketTypeTitle,
        eventName: data?.event!.EventName!,
        totalAmount: searchObj?.price! * formData.quantity,
      }, {
        onSuccess(data) {
          setIsSubmitting(false);
          if (data.transcation) {
            Router.push(`/transaction/${data.transcation.MerchantRequestID}`);

          } else {
            console.log("error")
          }
        }
      })

    console.log(formData);
  };

  const { data, isLoading, error } = trpc.useQuery([
    "event.getEvent",
    { eventName: props.slug },
  ]);

  const quantitys = Array.from(
    { length: data?.event!.EventMaxTickets! - data?.event!.TicketsSold! },
    (_, i) => i + 1
  );

  //TODO handle errors
  /* generateQR("bradley").then((url) => console.log(url)); //TODO remove debug logs on prod
  */

  console.log(props.slug);
  console.log({ data });

  if (isLoading) {
    return (

      <div className="bg-black grid h-screen place-items-center">
        <Image
          src={puff}
          width={64}
          height={64}
          alt="loading..."
          className=""
        />
        <p className="text-white">Loading</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className=" sm:ml-20 sm:m-4 ">

        {/* //TODO implement modal  <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Processing Purchase</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex flex-col">
                <div className="flex">{transactionWait()}</div>

                <div className="flex">{genWait()}</div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="ghost">Secondary Action</Button>
            </ModalFooter>
          </ModalContent>
        </Modal> */}
        <div className="max-w-2xl mx-auto grid items-center grid-cols-1 px-6 gap-y-16 gap-x-8 sm:px-6 sm:py-6 lg:max-w-7xl lg:px-8 lg:grid-cols-2">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 lg:gap-8 ">
            <div className="group relative p-0 m-3 mb-16 rounded-lg bg-black flex-auto">
              <div className="w-full min-h-80  aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                <img
                  src={data?.event!.EventPosterUrl}
                  className="object-center object-cover lg:w-full lg:h-full" //TODO use next/image here
                />
              </div>
              <div className="m-1 flex justify-between">
                <div>
                  <h3 className="text-sm  rounded-lg p-1">
                    <a className="text-primary">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 font-sans text-sm font-bold"
                      />
                      {data!.event!.EventName}
                    </a>
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div className="relative grid lg:grid-cols-2 grid-cols-1  gap-4 sm:gap-6 lg:gap-8 ">
            <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
              <label className="label">
                <span className="label-text">select ticket type</span>
              </label>
              <select
                {...register("ticketTypeTitle", { required: true })}
                className="select select-bordered "
                placeholder="select ticket"
              >
                {data?.event!.ticketTypes.map((val, index) => (
                  <option key={index} value={val.title}>
                    {`${val.title} ${val.price} ksh`}
                  </option>
                ))}
              </select>
              <label className="label">
                {errors.ticketTypeTitle && (
                  <span className="label-text-alt text-red-900">
                    This field is required
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
                className="select select-bordered "
                placeholder="1"
              >
                {quantitys.map((quantity, quantityIdx) => (
                  <option key={quantityIdx} value={quantity}>
                    {quantity}
                  </option>
                ))}
              </select>
              <label className="label">
                {errors.quantity && (
                  <span className="text-red-50 label-text-alt">
                    {" "}
                    This field is required
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
                    required: true,
                    valueAsNumber: true,
                  })}
                  className="input input-bordered"
                />
              </label>
              <label className="label">
                {errors.mobileNumber && (
                  <span className="text-red-50 label-text-alt">
                    {" "}
                    This field is required
                  </span>
                )}
              </label>

              <button className={isSubmitting ? "btn loading btn-disabled gap-2" : "btn gap-2"} disabled={isSubmitting ? true : false} type="submit">
                <FaMoneyCheckAlt />
                checkout

              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Event Description
            </h2>
            <p className="mt-4 text-gray-500">
              {data?.event!.EventDescription}
            </p>

            <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="border-t border-gray-200 pt-0"
                >
                  <dt className="font-medium text-gray-900">{feature.name}</dt>
                  <dd className="mb-20 text-sm text-gray-500">
                    {data?.event!.EventDate.toDateString()}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  let { slug } = context.query;

  slug = slug?.[0];
  console.log(slug);
  return {
    props: { slug },
  };
};
export default Ticket;
