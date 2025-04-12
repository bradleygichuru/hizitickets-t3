import { useState } from "react";
import { BiAddToQueue, BiSearchAlt } from "react-icons/bi";
import { AiOutlinePhone, AiOutlinePlus } from "react-icons/ai";
import ReactLoading from "react-loading";

import Layout from "../components/layout";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  useToast,
  Button,
  Alert,
  AlertIcon,
  AspectRatio,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "../server/firebaseConfig";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import Image from "next/image";
import ticketLogo from "../../public/ticket-svgrepo-com.svg";
import { useSession, signIn } from "next-auth/react";
import Decimal from "decimal.js";
import { DollarSign, Loader2, QrCode, Share2, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
let yourDate = new Date();
const offset = yourDate.getTimezoneOffset();
yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);

const FormSchema = z.object({
  mobileContact: z.string(),
  eventName: z.string(),
  eventDescription: z.string(),
  eventLocation: z.string(),
  eventDate: z.date(),
  eventTicketPrice: z.number(),
  eventMaxTickets: z.number(),
  eventPoster: z.custom<FileList>(),
  ticketType1Name: z.string(),
  ticketType1Price: z.number(),
  ticketType1Date: z.date(),
  ticketType2Name: z.string(),
  ticketType2Price: z.number(),
  ticketType2Date: z.date().nullish(),
  ticketType3Name: z.string(),
  ticketType3Price: z.number(),
  ticketType3Date: z.date().nullish(),
  ticketType4Price: z.number(),
  ticketType4Date: z.date().nullish(),
  ticketType4Name: z.string(),
  merchSlotOneTitle: z.string().nullish(),
  merchSlotOnePrice: z.number().nullish(),
  merchSlotOnePoster: z.custom<FileList>().nullish(),
  merchSlotTwoTitle: z.string().nullish(),
  merchSlotTwoPrice: z.number().nullish(),
  merchSlotTwoPoster: z.custom<FileList>().nullish(),
  merchSlotThreeTitle: z.string().nullish(),
  merchSlotThreePrice: z.number().nullish(),
  merchSlotThreePoster: z.custom<FileList>().nullish(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

const sorts = [
  "Sort By",
  "Date",
  "Revenue",
  "Tickets sold ",
  "Tickets remaining",
]; // TODO make sort types functional i.e work
type Merch = { name: string; price: number; MerchPosterUrl: File };
const DashBoard = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  //const [eventPoster, setEventPoster] = useState<File>();
  const [selectedSort, setSelectedSort] = useState(sorts[0]);
  const [mpesaWithdrawNo, setMpesaWithdrawNo] = useState("");
  const [editAddEvent, setEditAddEvent] = useState(true);
  const [editMerchSlotThree, setEditMerchSlotThree] = useState(false);
  const [editMerchSlotTwo, setEditMerchSlotTwo] = useState(false);
  const [editMerchSlotOne, setEditMerchSlotOne] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [merchandise, setMerchandise] = useState<Merch[]>();
  const { data: session, status } = useSession();
  /* console.log(session) */
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState<number>(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormSchemaType>();
  console.log(status);
  const merchSlotOnePosterReference = watch("merchSlotOnePoster");
  const merchSlotTwoPosterReference = watch("merchSlotTwoPoster");
  const merchSlotThreePosterReference = watch("merchSlotThreePoster");
  const eventPoster = watch("eventPoster");
  console.log({
    merchSlotOnePosterReference,
    merchSlotTwoPosterReference,
    merchSlotThreePosterReference,
    eventPoster,
  });
  const { data, isLoading } = trpc.events.getUserEvents.useQuery(
    { eventOrganizer: session?.user?.name as string },
    {
      onSuccess(data) {
        console.log(data);
      },
    }
  ); //TODO only execute query if session is present
  /*  console.log("Fields",watchAllFields); */
  const addEventMutation = trpc.events.addEvent.useMutation();

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    console.log(data);
    console.log({ errors });
    type MerchPayload = Array<{
      merchandiseName: string;
      merchandisePrice: number;
      merchandisePoster: string;
    }>;
    const addedMerch: MerchPayload = [];
    if (data?.merchSlotOnePrice && data?.merchSlotOneTitle) {
      const storageRef = ref(storage, merchSlotOnePosterReference?.[0]?.name);

      const snapshot = await uploadBytes(
        storageRef,
        merchSlotOnePosterReference?.[0] as Blob
      );
      const url = await getDownloadURL(snapshot.ref);
      if (url) {
        addedMerch.push({
          merchandiseName: data?.merchSlotOneTitle,
          merchandisePrice: data?.merchSlotOnePrice,
          merchandisePoster: url,
        });
      } else {
        toast({
          description: "Error uploading merch poster",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    if (data.merchSlotTwoPrice && data.merchSlotTwoTitle) {
      const storageRef = ref(storage, merchSlotOnePosterReference?.[0]?.name);

      const snapshot = await uploadBytes(
        storageRef,
        merchSlotOnePosterReference?.[0] as Blob
      );
      const url = await getDownloadURL(snapshot.ref);
      if (url) {
        addedMerch.push({
          merchandiseName: data.merchSlotTwoTitle,
          merchandisePrice: data.merchSlotTwoPrice,
          merchandisePoster: url,
        });
      } else {
        toast({
          description: "Error uploading merch poster",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    if (data.merchSlotThreePrice && data.merchSlotThreeTitle) {
      const storageRef = ref(storage, merchSlotOnePosterReference?.[0]?.name);

      const snapshot = await uploadBytes(
        storageRef,
        merchSlotOnePosterReference?.[0] as Blob
      );
      const url = await getDownloadURL(snapshot.ref);
      if (url) {
        addedMerch.push({
          merchandiseName: data.merchSlotThreeTitle,
          merchandisePrice: data.merchSlotThreePrice,
          merchandisePoster: url,
        });
      } else {
        toast({
          description: "Error uploading merch poster",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }

    const eventicketTypes = [
      {
        title: data.ticketType1Name,
        deadline: data.ticketType1Date,
        price: data.ticketType1Price,
      },
      {
        title: data.ticketType2Name,
        deadline: data.ticketType2Date!,
        price: data.ticketType2Price,
      },
      {
        title: data.ticketType3Name,
        deadline: data.ticketType3Date!,
        price: data.ticketType3Price,
      },
      {
        title: data.ticketType4Name,
        deadline: data.ticketType4Date!,
        price: data.ticketType4Price,
      },
    ];
    if (eventPoster?.[0]) {
      console.log(eventPoster?.[0]);
      setIsSubmitting((isSubmitting) => !isSubmitting);
      //const storageRef = ref(storage, eventPoster.name);
      const storageRef = ref(storage, eventPoster?.[0]?.name);

      //const snapshot = await uploadBytes(storageRef, eventPoster);
      const snapshot = await uploadBytes(storageRef, eventPoster?.[0] as Blob);
      const url = await getDownloadURL(snapshot.ref);

      if (url) {
        console.log(`${url}`);

        addEventMutation
          .mutateAsync({
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventDescription: data.eventDescription,
            mobileContact: data.mobileContact,
            merch: addedMerch,
            eventicketTypesParsed: eventicketTypes.filter((type) => {
              if (type.title.split(" ")[0] != "e.g" && type.title.length != 0) {
                console.log(type);
                return type;
              }
            }),
            eventLocation: data.eventLocation,
            eventMaxTickets: data.eventMaxTickets,
            eventPosterUrl: url,
            eventOrganizer: session?.user?.name as string,
          })
          .then(({ result }) => {
            if (result == "success") {
              setIsSubmitting(false);
              toast({
                title: "Success.",
                description: "Your event was submitted successfully",
                status: "success",
                duration: 9000,
                isClosable: true,
              });
              onClose();
            } else {
              toast({
                title: "Error",
                description:
                  "there was a problem submitting your event details",
                status: "error",
                duration: 9000,
                isClosable: true,
              });
            }
            console.log(result);
          });
      }
    } else {
      toast({
        title: "Field empty",
        description: "Event poster required",
        status: "error",
        duration: 9000,
      });
    }
  };
  if (status == "unauthenticated") {
    signIn(undefined, { callbackUrl: "/dashboard" });
  }

  if (status == "loading") {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <Loader2 type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-black">Authenticating</span>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center bg-base-100 text-base-content">
        <Loader2 type="spin" height={100} width={100} />
      </div>
    );
  }
  if (status == "authenticated") {
    return (
      <Layout>
        <div className="grid h-screen grid-cols-1 p-1 sm:ml-24">
          <button
            onClick={() => {
              onOpen();
            }}
            className="button hover:btn-accent-focus btn-accent btn my-1 rounded"
          >
            Add Event
            <BiAddToQueue className="ml-6 h-6 w-6" />
          </button>
          {editAddEvent ? (
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Add Event</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className="mt-2">
                    <form
                      className="form-control"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <label htmlFor="eventName" className="label">
                        Event name
                      </label>
                      <input
                        className="input-bordered input m-2 w-full max-w-xs"
                        {...register("eventName", { required: true })}
                        id="eventName"
                        placeholder="event name"
                      />
                      {errors.eventName && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <label htmlFor="eventDescription" className="label">
                        Event description
                      </label>
                      <textarea
                        className="textarea-bordered textarea m-2"
                        {...register("eventDescription", { required: true })}
                        id="eventDescription"
                        placeholder="event description ............"
                      />
                      {errors.eventDescription && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <label htmlFor="eventdescription" className="label">
                        Event location
                      </label>
                      <input
                        className="input-bordered input m-2 w-full max-w-xs"
                        {...register("eventLocation", { required: true })}
                        id="eventLocation"
                        placeholder="event location ............"
                      />
                      {errors.eventLocation && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <Alert className="m-4" status="info">
                        <AlertIcon />
                        On the Events Tickets section, filling the first ticket
                        type is mandatory
                      </Alert>
                      <label htmlFor="eventTicketTypes" className="label">
                        Event Tickets
                      </label>

                      <div className="dropdown">
                        <label tabIndex={0} className="btn-outline btn m-1">
                          Edit ticket type 1
                        </label>

                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1]  menu rounded-box w-52 bg-base-100 p-2 shadow"
                        >
                          {" "}
                          <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                            <label tabIndex={0} className="label m-1">
                              Ticket title
                            </label>
                            <input
                              type="text"
                              {...register("ticketType1Name", {
                                required: true,
                              })}
                              placeholder="e.g Regular"
                              id="ticketType1Name"
                              className="input-bordered input m-2 "
                            />
                            {errors.ticketType1Name && (
                              <label className="label">
                                <span className="text-red-900">
                                  This field is required
                                </span>
                              </label>
                            )}

                            <label tabIndex={0} className="label m-1">
                              Price
                            </label>
                            <input
                              type="number"
                              {...register("ticketType1Price", {
                                required: true,
                                valueAsNumber: true,
                              })}
                              placeholder="Price"
                              className="input-bordered input m-2 "
                            />
                            {errors.ticketType1Price && (
                              <label className="label">
                                <span className="text-red-900">
                                  This field is required
                                </span>
                              </label>
                            )}

                            <label tabIndex={0} className="label m-1">
                              Purchase Deadline
                            </label>
                            <input
                              type="date"
                              {...register("ticketType1Date", {
                                valueAsDate: true,
                                required: true,
                              })}
                              placeholder="Deadline"
                              className="input-bordered input m-2 "
                            />
                            {errors.ticketType1Date && (
                              <label className="label">
                                <span className="text-red-900">
                                  This field is required
                                </span>
                              </label>
                            )}
                          </div>
                        </ul>
                      </div>
                      {(errors.ticketType1Date ||
                        errors.ticketType1Price ||
                        errors.ticketType1Name) && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <div className="dropdown">
                        <label tabIndex={0} className="btn-outline btn m-1 ">
                          Edit ticket type 2
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu rounded-box w-52 bg-base-100 p-2 shadow"
                        >
                          <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                            <label tabIndex={0} className="label m-1">
                              Ticket title
                            </label>
                            <input
                              type="text"
                              {...register("ticketType2Name")}
                              placeholder="e.g Vip"
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Price
                            </label>
                            <input
                              {...register("ticketType2Price", {
                                valueAsNumber: true,
                              })}
                              placeholder="Price"
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Purchase Deadline
                            </label>
                            <input
                              type="date"
                              {...register("ticketType2Date", {
                                valueAsDate: true,
                              })}
                              placeholder="Deadline"
                              className="input-bordered input m-2 "
                            />
                          </div>
                        </ul>
                      </div>
                      <div className="dropdown">
                        <label tabIndex={0} className="btn-outline btn m-1 ">
                          Edit ticket type 3
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu rounded-box w-52 bg-base-100 p-2 shadow"
                        >
                          <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                            <label tabIndex={0} className="label m-1">
                              Ticket title
                            </label>
                            <input
                              type="text"
                              {...register("ticketType3Name")}
                              placeholder="e.g Group"
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Price
                            </label>
                            <input
                              type="number"
                              {...register("ticketType3Price", {
                                valueAsNumber: true,
                              })}
                              placeholder="Price"
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Purchase deadline
                            </label>
                            <input
                              type="date"
                              {...register("ticketType3Date", {
                                valueAsDate: true,
                              })}
                              placeholder="Deadline"
                              className="input-bordered input m-2 "
                            />
                          </div>
                        </ul>
                      </div>
                      <div className="dropdown">
                        <label tabIndex={0} className="btn-outline btn m-1 ">
                          Edit ticket type 4
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu rounded-box w-52 bg-base-100 p-2 shadow"
                        >
                          <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                            <label tabIndex={0} className="label m-1">
                              Ticket title
                            </label>
                            <input
                              type="text"
                              placeholder="e.g Advance Ticket"
                              {...register("ticketType4Name")}
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Price
                            </label>
                            <input
                              type="number"
                              {...register("ticketType4Price", {
                                valueAsNumber: true,
                              })}
                              defaultValue={0}
                              placeholder="Price"
                              className="input-bordered input m-2 "
                            />
                            <label tabIndex={0} className="label m-1">
                              Purchase deadline
                            </label>
                            <input
                              type="date"
                              {...register("ticketType4Date", {
                                valueAsDate: true,
                              })}
                              placeholder="Deadline"
                              className="input-bordered input m-2 "
                            />
                          </div>
                        </ul>
                      </div>

                      <label htmlFor="eventMaxTickets" className="label">
                        Maximum tickets for sale
                      </label>

                      <input
                        className="input-bordered input m-2 w-full max-w-xs"
                        {...register("eventMaxTickets", {
                          required: true,
                          valueAsNumber: true,
                        })}
                        id="eventMaxTickets"
                        placeholder="maximum ticket for sale"
                        type="number"
                      />

                      {errors.eventMaxTickets && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <label htmlFor="eventDate" className="label">
                        Event date
                      </label>
                      <input
                        className="input-bordered input m-2 w-full max-w-xs"
                        {...register("eventDate", {
                          required: true,
                          valueAsDate: true,
                        })}
                        id="eventDate"
                        type="date"
                        placeholder="event date"
                      />
                      {errors.eventDate && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <label htmlFor="mobileContact" className="label">
                        Mobile Contact
                      </label>
                      <InputGroup className="m-2">
                        <InputLeftElement pointerEvents="none">
                          <AiOutlinePhone />
                        </InputLeftElement>
                        <Input
                          {...register("mobileContact", {
                            required: true,
                          })}
                          type="tel"
                          placeholder="Phone number"
                        />
                      </InputGroup>

                      {errors.mobileContact && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}
                      <div>
                        <label className="label">Event Poster</label>
                        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                {eventPoster?.[0] ? (
                                  <span>{eventPoster?.[0]?.name}</span>
                                ) : (
                                  <span>Upload a file</span>
                                )}
                                <input
                                  className="sr-only"
                                  accept=".jpg, .png"
                                  type="file"
                                  {...register("eventPoster", {
                                    required: true,
                                  })}
                                />
                              </label>

                              {eventPoster?.[0] ? (
                                ""
                              ) : (
                                <p className="pl-1">or drag and drop</p>
                              )}
                            </div>
                            {eventPoster?.[0] ? (
                              ""
                            ) : (
                              <p className="text-xs text-gray-500">
                                PNG, JPG up to 10MB
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {errors.eventPoster && (
                        <label className="label">
                          <span className="text-red-900">
                            This field is required
                          </span>
                        </label>
                      )}

                      <div>
                        <label className="label">Sellable items</label>
                        <div className="flex flex-row ">
                          <label
                            tabIndex={0}
                            onClick={() => {
                              setEditMerchSlotOne(true);
                            }}
                            className="btn m-1"
                          >
                            <AiOutlinePlus />
                          </label>
                          <label
                            onClick={() => {
                              setEditMerchSlotTwo(true);
                            }}
                            tabIndex={0}
                            className="btn m-1"
                          >
                            <AiOutlinePlus />
                          </label>
                          <label
                            onClick={() => {
                              setEditMerchSlotThree(true);
                            }}
                            tabIndex={0}
                            className="btn m-1"
                          >
                            <AiOutlinePlus />
                          </label>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        isLoading={isSubmitting}
                        className="mt-4 bg-accent"
                        type="submit"
                      >
                        Submit
                      </Button>
                    </form>
                  </div>
                </ModalBody>

                <ModalFooter></ModalFooter>
              </ModalContent>
            </Modal>
          ) : (
            ""
          )}

          {editMerchSlotOne ? (
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>merch slot 1</ModalHeader>
                <ModalBody>
                  <label htmlFor="eventDate" className="label">
                    Merch title
                  </label>
                  <input
                    {...register("merchSlotOneTitle")}
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="merch title"
                  />

                  <label className="label">Merch price</label>
                  <input
                    {...register("merchSlotOnePrice", { valueAsNumber: true })}
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="in kes"
                    type="number"
                  />

                  {/*<label className="label">Maximum merchandise inventory</label>
                  <input

                    {...register("merchSlotOne",{valueAsNumber:true})}
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="0"
                  />*/}
                  <div>
                    <label className="label">Merch Image</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                            {merchSlotOnePosterReference?.[0] ? (
                              <span>
                                {merchSlotOnePosterReference?.[0]?.name}
                              </span>
                            ) : (
                              <span>Upload a file</span>
                            )}
                            <input
                              type="file"
                              className="sr-only"
                              accept=".jpg, .png"
                              {...register("merchSlotOnePoster")}
                            />
                          </label>

                          {merchSlotOnePosterReference?.[0] ? (
                            ""
                          ) : (
                            <p className="pl-1">or drag and drop</p>
                          )}
                        </div>
                        {merchSlotOnePosterReference?.[0] ? (
                          ""
                        ) : (
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => {
                      //onClose();
                      setEditMerchSlotOne(false);
                      //setEditAddEvent(true);
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          ) : (
            ""
          )}
          {editMerchSlotTwo ? (
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>merch slot 2</ModalHeader>
                <ModalBody>
                  <label htmlFor="eventDate" className="label">
                    Merch title
                  </label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="merch title"
                    {...register("merchSlotTwoTitle")}
                  />

                  <label className="label">Merch price</label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="in kes"
                    type="number"
                    {...register("merchSlotTwoPrice", { valueAsNumber: true })}
                  />

                  {/* <label className="label">Maximum merchandise inventory</label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="0"
                  /> */}
                  <div>
                    <label className="label">Merch Image</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                            {merchSlotTwoPosterReference?.[0] ? (
                              <span>
                                {merchSlotTwoPosterReference?.[0]?.name}
                              </span>
                            ) : (
                              <span>Upload a file</span>
                            )}
                            <input
                              type="file"
                              className="sr-only"
                              accept=".jpg, .png"
                              {...register("merchSlotTwoPoster")}
                            />
                          </label>

                          {merchSlotTwoPosterReference?.[0] ? (
                            ""
                          ) : (
                            <p className="pl-1">or drag and drop</p>
                          )}
                        </div>
                        {merchSlotTwoPosterReference?.[0] ? (
                          ""
                        ) : (
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => {
                      //onClose();
                      setEditMerchSlotTwo(false);
                      //setEditAddEvent(true);
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          ) : (
            ""
          )}
          {editMerchSlotThree ? (
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>merch slot 3</ModalHeader>
                <ModalBody>
                  <label htmlFor="eventDate" className="label">
                    Merch title
                  </label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="merch title"
                    {...register("merchSlotThreeTitle")}
                  />

                  <label className="label">Merch price</label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="in kes"
                    type="number"
                    {...register("merchSlotThreePrice", {
                      valueAsNumber: true,
                    })}
                  />

                  {/* <label className="label">Maximum merchandise inventory</label>
                  <input
                    className="input-bordered input m-2 w-full max-w-xs"
                    placeholder="0"
                  /> */}
                  <div>
                    <label className="label">Merch Image</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                            {merchSlotThreePosterReference?.[0] ? (
                              <span>
                                {merchSlotThreePosterReference?.[0]?.name}
                              </span>
                            ) : (
                              <span>Upload a file</span>
                            )}
                            <input
                              type="file"
                              className="sr-only"
                              accept=".jpg, .png"
                              {...register("merchSlotThreePoster")}
                            />
                          </label>

                          {merchSlotThreePosterReference?.[0] ? (
                            ""
                          ) : (
                            <p className="pl-1">or drag and drop</p>
                          )}
                        </div>
                        {merchSlotThreePosterReference?.[0] ? (
                          ""
                        ) : (
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => {
                      //onClose();
                      setEditMerchSlotThree(false);
                      //setEditAddEvent(true);
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          ) : (
            ""
          )}

          {data?.events?.length == 0 ? (
            <div className="grid h-screen place-items-center font-extrabold bg-base-100  text-xl  text-base-content">
              <Image src={ticketLogo} width={100} alt="ticket" height={100} />
              No Events
            </div>
          ) : (
            <div className="m-5 mx-auto w-screen flex flex-col rounded-3xl p-1">
              {data?.events?.map((event, index: number) => {
                let ticketNumbers = 0;
                // const revenue = new Decimal(0);
                let ticketsScanned = [];
                event.transactions.forEach((val) => {
                  ticketNumbers += val.tickets.length;
                  ticketsScanned = val.tickets.filter((ticket) => {
                    return ticket.Scanned === true;
                  });
                });
                return (
                  <div
                    key={event.EventId}
                    className="border-2 rounded-xl shadow-lg p-5 m-2"
                  >
                    <div className="grid gap-1 md:grid-cols-4 lg:grid-cols-4 mb-8">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Tickets Purchased
                          </CardTitle>
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {ticketNumbers.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Revenue Earned
                          </CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {new Decimal(event?.TicketRevenue).toNumber()}KES{" "}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Tickets Distributed
                          </CardTitle>
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {ticketsScanned?.length?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Tickets Scanned
                          </CardTitle>
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {ticketsScanned?.length?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      {event.ticketTypes.map((type, typeIndex) => {
                        let typeCount = 0;
                        event.transactions.forEach((val, _) => {
                          if (val.ticketTypeTitle == type.title) {
                            typeCount = typeCount + val.tickets.length;
                          }
                        });
                        return (
                          <Card key={type.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {type.title} tickets distributed
                              </CardTitle>
                              <QrCode className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {typeCount.toLocaleString()}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Location</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                {event?.EventName}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  event?.EventDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{event.EventLocation}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    {/*<Card className="m-3">
                      <CardHeader>
                        <CardTitle>WithDraw Funds</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          onChange={(e) => {
                            setMpesaWithdrawNo(e.target.value.trim());
                          }}
                          value={mpesaWithdrawNo}
                          className="m-2"
                          placeholder="enter mpesa number"
                        />
                        <Button className="m-1">Withrdraw</Button>
                      </CardContent>
                        </Card>*/}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }
};

export default DashBoard;
