import { useState } from "react";
import { BiAddToQueue, BiSearchAlt } from "react-icons/bi";
import { AiOutlinePhone } from "react-icons/ai";
import ReactLoading from "react-loading";
import Layout from "../components/layout";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast,Button, Alert, AlertIcon, AspectRatio,Input,InputGroup,InputLeftElement } from "@chakra-ui/react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "../server/firebaseConfig";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import Image from "next/image";
import ticketLogo from "../../public/ticket-svgrepo-com.svg";
import { useSession, signIn } from "next-auth/react";
let yourDate = new Date();
const offset = yourDate.getTimezoneOffset();
yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);

const FormSchema = z.object({
  mobileContact:z.string(),
  eventName: z.string(),
  eventDescription: z.string(),
  eventLocation: z.string(),
  eventDate: z.date(),
  eventTicketPrice: z.number(),
  eventMaxTickets: z.number(),
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
});
type FormSchemaType = z.infer<typeof FormSchema>;

const sorts = [
  "Sort By",
  "Date",
  "Revenue",
  "Tickets sold ",
  "Tickets remaining",
]; // TODO make sort types functional i.e work

const DashBoard = () => {
  const toast = useToast();
  const [eventPoster, setEventPoster] = useState<File>();
  const [selectedSort, setSelectedSort] = useState(sorts[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
    if (eventPoster) {
      console.log(eventPoster);
      setIsSubmitting((isSubmitting) => !isSubmitting);
      const storageRef = ref(storage, eventPoster.name);
      const snapshot = await uploadBytes(storageRef, eventPoster);
      const url = await getDownloadURL(snapshot.ref);

      if (url) {
        console.log(`${url}`);

        addEventMutation
          .mutateAsync({
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventDescription: data.eventDescription,
            mobileContact:data.mobileContact,
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
    }
  };
  if (status == "unauthenticated") {
    signIn(undefined, { callbackUrl: "/dashboard" });
  }

  if (status == "loading") {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-black">Authenticating</span>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center bg-base-100 text-base-content">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
      </div>
    );
  }
  if (status == "authenticated") {
    return (
      <Layout>
        <div className="grid h-screen grid-cols-1 p-1 sm:ml-24">
          <label
            htmlFor="my-modal-3"
            className="modal-button hover:btn-accent-focus btn-accent btn my-1 rounded"
          >
            Add Event
            <BiAddToQueue className="ml-6 h-6 w-6" />
          </label>
          <input type="checkbox" id="my-modal-3" className="modal-toggle" />

          <div className="modal">
            <div className="modal-box relative max-w-md">
              <h3 className="text-lg font-bold">Add Event</h3>
              <label
                htmlFor="my-modal-3"
                className="btn-sm btn-circle btn absolute right-2 top-2"
              >
                ✕
              </label>
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
                    placeholder="event name "
                  />
                  {errors.eventName && (
                    <label className="label">
                      <span className="text-error-content">
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
                      <span className="text-error-content">
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
                      <span className="text-error-content">
                        This field is required
                      </span>
                    </label>
                  )}

                  <Alert className="m-4" status="info">
                    <AlertIcon />
                    On the Events Tickets section, filling the first ticket type
                    is mandatory
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
                      className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
                    >
                      {" "}
                      <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType1Name")}
                          placeholder="e.g Regular"
                          id="ticketType1Name"
                          defaultValue={"e.g regular"}
                          className="input-bordered input m-2 "
                        />
                        <label tabIndex={0} className="label m-1">
                          Price
                        </label>
                        <input
                          type="number"
                          {...register("ticketType1Price", {
                            valueAsNumber: true,
                          })}
                          placeholder="Price"
                          defaultValue={0}
                          className="input-bordered input m-2 "
                        />
                        <label tabIndex={0} className="label m-1">
                          Purchase Deadline
                        </label>
                        <input
                          type="date"
                          {...register("ticketType1Date", {
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
                      Edit ticket type 2
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
                    >
                      <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType2Name")}
                          placeholder="e.g Vip"
                          defaultValue={"e.g Vip"}
                          className="input-bordered input m-2 "
                        />
                        <label tabIndex={0} className="label m-1">
                          Price
                        </label>
                        <input
                          {...register("ticketType2Price", {
                            valueAsNumber: true,
                          })}
                          defaultValue={0}
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
                          defaultValue={yourDate.toISOString().split("T")[0]}
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
                      className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
                    >
                      <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType3Name")}
                          placeholder="e.g Group"
                          defaultValue={"e.g Group"}
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
                          defaultValue={0}
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
                          defaultValue={yourDate.toISOString().split("T")[0]}
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
                      className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
                    >
                      <div className="m-2 flex flex-col rounded-lg border-2 border-neutral">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g Advance Ticket"
                          {...register("ticketType4Name")}
                          defaultValue={"e.g Group"}
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
                          defaultValue={yourDate.toISOString().split("T")[0]}
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
                      <span className="text-error-content">
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
                      <span className="text-error-content">
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
                    <Input {...register("mobileContact", {
                      required: true,
                    })} type="tel" placeholder="Phone number" />
                    
                  </InputGroup>
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
                          <label
                            htmlFor="file-upload"
                            className="l relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={(e) => {
                                setEventPoster(e.target.files?.[0]);
                              }}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
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
            </div>
          </div>

          {data?.events.length == 0 ? (
            <div className="grid h-screen place-items-center font-extrabold bg-base-100  text-xl m-10 text-base-content">
              <Image src={ticketLogo} width={100} alt="ticket" height={100} />
              No Events
            </div>
          ) : (
            <div className="m-5 mx-auto grid grid-cols-2 rounded-3xl bg-base-100 p-3 sm:grid sm:auto-cols-auto">
              {data?.events.map((event, index) => {
                let ticketNumbers = 0;
                let revenue = 0;
                let ticketsScanned = [];
                event.transactions.forEach((val, _) => {
                  revenue += val.TotalAmount;
                  ticketNumbers += val.tickets.length;
                  ticketsScanned = val.tickets.filter((ticket) => {
                    return ticket.Scanned === true;
                  });
                });
                return (
                  <>
                    <div
                      key={index}
                      className="lg:w-41 group relative m-3 mb-40 rounded-lg bg-neutral p-0 sm:mb-16 sm:w-52"
                    >
                      <AspectRatio maxW="400px" ratio={1}>
                        <img
                          src={event.EventPosterUrl}
                          className="lg:w-41 object-cover object-center " //TODO use next/image here
                        />
                      </AspectRatio>
                      <div className="m-1 flex justify-between">
                        <div>
                          <h3 className="rounded-lg  p-1 text-sm">
                            <a className="text-neutral-content">
                              <span
                                aria-hidden="true"
                                className=" absolute inset-0 font-sans text-sm font-bold "
                              />
                              {event.EventName}
                            </a>
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="mb-14 flex flex-col">
                      <div className="stats m-1 shadow">
                        <div className="stat overflow-hidden">
                          <div className="stat-title">Total Revenue</div>
                          <div className="stat-value">{revenue}</div>
                          <div className="stat-desc">
                            units in Kenyan Shillings
                          </div>
                        </div>
                      </div>
                      <div className="stats m-1 shadow">
                        <div className="stat overflow-hidden">
                          <div className="stat-title">Total Tickets Sold</div>
                          <div className="stat-value">{ticketNumbers}</div>
                          <div className="stat-desc"></div>
                        </div>
                      </div>
                      {event.ticketTypes.map((type, typeIndex) => {
                        let typeCount = 0;
                        event.transactions.forEach((val, _) => {
                          if (val.ticketTypeTitle == type.title) {
                            typeCount = typeCount + val.tickets.length;
                          }
                        });
                        return (
                          <div key={typeIndex} className="stats m-1 shadow">
                            <div className="stat overflow-hidden">
                              <div className="stat-title">
                                {type.title} tickets sold
                              </div>
                              <div className="stat-value">{typeCount}</div>
                              <div className="stat-desc"></div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="stats m-1 shadow">
                        <div className="stat overflow-hidden">
                          <div className="stat-title">Tickets Scanned</div>
                          <div className="stat-value">
                            {ticketsScanned.length}
                          </div>
                          <div className="stat-desc"></div>
                        </div>
                      </div>
                    </div>
                  </>
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
