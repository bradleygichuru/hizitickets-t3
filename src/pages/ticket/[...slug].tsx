import { Fragment, useEffect, createRef, useState, Key } from "react";

import { FaMoneyCheckAlt } from "react-icons/fa";


/* import generateQR from "../../lib/Base64UrlGenerator"; */


import { GetStaticProps, GetServerSideProps } from "next";
import React from "react";
import Quixote from "../../components/Ticket";
import { trpc } from "../../utils/trpc";
import Layout from "../../components/layout";

//TODO area code satination in mpesa number input field
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
const features = [
  {
    name: "Time",
  },
];

//TODO quantity will be set programatically from values in the database and be reduced on ticket purchase
const quantitys = ["1", "2", "3", "4"];

const Ticket: React.FC<{ slug: string }> = (props) => {
  const [selectedType, setSelectedType] = useState("Select ticket");
  const [selectedQuantity, setSelectedQuantity] = useState(quantitys[0]);
  const [phoneNumber, setPhoneNumber] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionQueued, setTransactionQueued] = useState(false);
  const [transactionValidity, setTransactionValidity] = useState(false);
  const [MerchantRequestID, setMerchantRequestID] = useState("");

  
 
  const { isLoading, error, data } = trpc.useQuery(["event.getEvent",{eventName:props.slug}])
  //TODO handle errors
  /* generateQR("bradley").then((url) => console.log(url)); //TODO remove debug logs on prod
  let transactionWait = () => {
    if (transactionValidity == false) {
      return (
        <div className="flex ">
        
          <p className="m-4">Waiting of transaction confirmation</p>
        </div>
      );
    }
  }; */
  let genWait = () => {
    if (transactionValidity == false) {
      return (
        <div className="flex">
         
          <p className="m-4">Generating ticket</p>
        </div>
      );
    }
  };
  console.log(props.slug);
  console.log({ data });

  if (isLoading) {
    return (
     <p>loading</p>
    );
  }

  return (
    <Layout>
      <div className=" sm:ml-20 sm:m-4 ">
        {" "}
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
                  src={data?.event?.EventPosterUrl}
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
                      {data!.event?.EventName}
                    </a>
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div className="relative grid lg:grid-cols-2 grid-cols-1  gap-4 sm:gap-6 lg:gap-8 ">
            <label
              htmlFor="Listbox"
              className="mt-4 block text-sm font-extrabold text-gray-700"
            >
              select ticket type
            </label>
            <select
              className="select"
              onChange={(e) => {
                setSelectedType(e.target.value);
              }}
              placeholder="select ticket"
            >
              {data?.event!.ticketTypes.map(
                (
                  val,index
                ) => (
                  <option key={index} value={val.title}>
                    {val.title}
                  </option>
                )
              )}
            </select> 
            <select
              className="select"
              placeholder="1"
              onChange={(e) => {
                setSelectedQuantity(e.target.value);
              }}
            >
              {quantitys.map((quantity, quantityIdx) => (
                <option key={quantityIdx} value={quantity}>
                  {quantity}
                </option>
              ))}
            </select>

            <input
                type="tel"
                placeholder="mpesa mobile number"
               className="input"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(parseInt(e.target.value));
                }}
              />
           
            <button className="btn"
              onClick={ async () => {
                setIsSubmitting((status) => !status);
                fetch("/api/buy", {
                  body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    selectedQuantity: selectedQuantity,
                    selectedType: selectedType,
                    eventId: data?.event?.EventId!
                  }),

                  headers: {
                    "Content-Type": "application/json",
                  },
                  method: "POST",
                })
                  .then((res) => res.json())
                  .then((data) => {
                    setIsSubmitting((status) => !status);
                    if (data.MpesaResponseCode == "0") {
                      setMerchantRequestID(data.MerchantRequestID);
                      setTransactionQueued((status) => !status);
                     /* //TODO toast toast({
                        title: "transaction initiated",
                        description: data.Message,
                        status: "success",
                        duration: 9000,
                        isClosable: true,
                      }); */
                     /*  onOpen(); */
                    } else {
                     /*// TODO   toast({
                        title: "transaction failed",
                        description: data.Message,
                        status: "error",
                        duration: 9000,
                        isClosable: false,
                      }); */
                    }
                  });
              } }
            >
              checkout
            </button>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Event Description
            </h2>
            <p className="mt-4 text-gray-500">{data?.event?.EventDescription}</p>

            <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="border-t border-gray-200 pt-0"
                >
                  <dt className="font-medium text-gray-900">{feature.name}</dt>
                  <dd className="mb-20 text-sm text-gray-500">
                    {data?.event?.EventDate.toDateString()}
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
