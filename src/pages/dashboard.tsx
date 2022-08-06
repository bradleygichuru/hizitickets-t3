import { NextPage } from "next";
import { useState } from "react";
import { BiAddToQueue, BiSearchAlt } from "react-icons/bi";
import Layout from "../components/layout";
import { SubmitHandler, useForm } from "react-hook-form";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "../server/firebaseConfig";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import { useSession } from "next-auth/react";
import LoginButton from "../components/LoginButton";
let yourDate = new Date();
const offset = yourDate.getTimezoneOffset();
yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
//TODO if no events show skeleton
console.log(yourDate.toISOString().split("T")[0]);

const FormSchema = z.object({
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
// TODO user should not get to this page without signing in
const DashBoard = () => {
  const [eventPoster, setEventPoster] = useState<File>();
  const [selectedSort, setSelectedSort] = useState(sorts[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { data: session, status } = useSession();
  /* console.log(session) */
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormSchemaType>();
  const watchAllFields = watch();
  const { data, isLoading } = trpc.useQuery(
    ["event.getUserEvents", { eventOrganizer: session?.user?.name! }],
    {
      onSuccess(data) {
        console.log(data);
      },
    }
  );
  /*  console.log("Fields",watchAllFields); */
  const addEventMutation = trpc.useMutation("event.addEvent");

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
            eventicketTypesParsed: eventicketTypes.filter((type) => {
              if (type.title.split(" ")[0] != "e.g" && type.title.length != 0) {
                console.log(type);
                return type;
              }
            }),
            eventLocation: data.eventLocation,
            eventMaxTickets: data.eventMaxTickets,
            eventPosterUrl: url,
            eventOrganizer: session?.user?.name!,
          })
          .then((result) => {
            console.log(result);
            // TODO modals and stat calculation
          });
      }
    }
  };
  if (!session) {
    return <LoginButton />;
  }
  if (session) {
    return (
      <Layout>
        <div className="grid grid-cols-1 sm:ml-24 p-1 ">
          <label
            htmlFor="my-modal-3"
            className="my-1 btn modal-button bg-accent hover:bg-indigo-700"
          >
            Add Event
            <BiAddToQueue className="w-6 h-6 ml-6" />
          </label>
          <input type="checkbox" id="my-modal-3" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box relative max-w-md">
              <h3 className="font-bold text-lg">Add Event</h3>
              <label
                htmlFor="my-modal-3"
                className="btn btn-sm btn-circle absolute right-2 top-2"
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
                    className="m-2 input input-bordered w-full max-w-xs"
                    {...register("eventName", { required: true })}
                    id="eventName"
                    placeholder="event name "
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
                    className="m-2 textarea textarea-bordered"
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
                    className="m-2 input input-bordered w-full max-w-xs"
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

                  <label htmlFor="eventTicketTypes" className="label">
                    Event Tickets
                  </label>
                  {/*  <textarea
                  className="m-2 textarea textarea-bordered"
                  {...register("eventTicketTypes", { required: true })}
                  id="eventTicketTypes"
                  placeholder="Please follow this format, with each ticket type in its new line e.g Regular - 3000ksh - 12/08/2022 .......... format : TicketType - (price)ksh - dd/mm/yy "
                /> */}

                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline m-1">
                      Edit ticket type 1
                    </label>

                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      {" "}
                      <div className="flex m-2 flex-col border-2 border-neutral rounded-lg">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType1Name")}
                          placeholder="e.g Regular"
                          id="ticketType1Name"
                          defaultValue={"e.g regular"}
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
                        />
                      </div>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline m-1 ">
                      Edit ticket type 2
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <div className="flex m-2 flex-col border-2 border-neutral rounded-lg">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType2Name")}
                          placeholder="e.g Vip"
                          defaultValue={"e.g Vip"}
                          className="m-2 input input-bordered "
                        />
                        <label tabIndex={0} className="label m-1">
                          Price
                        </label>
                        <input
                          type="number"
                          {...register("ticketType2Price", {
                            valueAsNumber: true,
                          })}
                          defaultValue={0}
                          placeholder="Price"
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
                        />
                      </div>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline m-1 ">
                      Edit ticket type 3
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <div className="flex m-2 flex-col border-2 border-neutral rounded-lg">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          {...register("ticketType3Name")}
                          placeholder="e.g Group"
                          defaultValue={"e.g Group"}
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
                        />
                      </div>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline m-1 ">
                      Edit ticket type 4
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <div className="flex m-2 flex-col border-2 border-neutral rounded-lg">
                        <label tabIndex={0} className="label m-1">
                          Ticket title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g Advance Ticket"
                          {...register("ticketType4Name")}
                          defaultValue={"e.g Group"}
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
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
                          className="m-2 input input-bordered "
                        />
                      </div>
                    </ul>
                  </div>
                  {/* 
                {errors.eventTicketTypes && (
                  <label className="label">
                    <span className="text-red-900">This field is required</span>
                  </label>
                )} */}

                  <label htmlFor="eventMaxTickets" className="label">
                    Maximum tickets for sale
                  </label>

                  <input
                    className="m-2 input input-bordered w-full max-w-xs"
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
                    className="m-2 input input-bordered w-full max-w-xs"
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

                  {/*   <input
                  id="eventPoster"
                  className="m-2"
                  type="file"
                  onChange={(e) => {
                    setEventPoster(e.target.files?.[0]);
                  }}
                /> */}

                  <label
                    htmlFor="formFileMultiple"
                    className="label inline-block mb-2 text-gray-700"
                  >
                    Event Poster
                  </label>
                  <input
                    className="form-control
																	block
																	w-full
																	px-3
																	py-1.5
																	text-base
																	font-normal
																	text-gray-700
																	bg-white bg-clip-padding
																	border border-solid border-gray-300
																	rounded
																	transition
																	ease-in-out
																
																	focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    type="file"
                    id="formFileMultiple"
                    onChange={(e) => {
                      setEventPoster(e.target.files?.[0]);
                    }}
                  />

                  <button className="mt-4 bg-accent btn" type="submit">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="flex justify-self-start bg-primary m-2.5 rounded-lg ">
            <div className="input-group mx-auto">
              <input
                type="text"
                placeholder="Search…"
                className="input input-bordered"
              />
              <button className="btn bg-accent btn-square">
                <BiSearchAlt className="m-3.5" />
              </button>
            </div>
          </div>

          <div className="p-2 flex content-around">
            <div className="  w-auto  mt-1 rounded-lg flex ">
              <div className="input-group">
                <select
                  className="select"
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                  }}
                >
                  {sorts.map((val, index) => (
                    <option key={index} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
                <button className="btn">Go</button>
              </div>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 bg-primary m-5 rounded-3xl sm:grid sm:auto-cols-auto mx-auto">
            {data?.events.map((event, index) => {
              return (
                <>
                  <div
                    key={index}
                    className="group relative p-0 m-3 mb-40 rounded-lg bg-black lg:w-41 sm:mb-16 sm:w-52"
                  >
                    <div className="min-h-80 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                      <img
                        src={event.EventPosterUrl}
                        className="object-center object-cover lg:w-41 lg:h-full" //TODO use next/image here
                      />
                    </div>
                    <div className="m-1 flex justify-between">
                      <div>
                        <h3 className="text-sm  rounded-lg p-1">
                          <a className="text-primary">
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
                  <div className="flex flex-col mb-14">
                    <div className="stats shadow m-1">
                      <div className="stat overflow-hidden">
                        <div className="stat-title">Total Revenue</div>
                        <div className="stat-value">{event.TotalRevenue}</div>
                        <div className="stat-desc">
                          21% more than last month
                        </div>
                      </div>
                    </div>
                    <div className="stats shadow m-1">
                      <div className="stat overflow-hidden">
                        <div className="stat-title">Total Tickets Sold</div>
                        <div className="stat-value">{event.TicketsSold}</div>
                        <div className="stat-desc">
                          21% more than last month
                        </div>
                      </div>
                    </div>
                    <div className="stats shadow m-1">
                      <div className="stat overflow-hidden">
                        <div className="stat-title">Tickets Remain</div>
                        <div className="stat-value">
                          {event.EventMaxTickets}
                        </div>
                        <div className="stat-desc">
                          21% more than last month
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }
};

export default DashBoard;
