import { trpc } from "../utils/trpc";
import Image from "next/image";

import ticketLogo from "../../public/ticket-svgrepo-com.svg";
import error from "../../public/error.svg";
import { useSession, signIn, signOut } from "next-auth/react";
import ReactLoading from "react-loading";
import EventInfo from "../components/EventValidationEntry";
const AdminPage = () => {
  const { data: session, status } = useSession();
  const { data, isLoading } = trpc.events.getEvents.useQuery();
  console.log(session);
  if (status == "unauthenticated") {
    signIn(undefined, { callbackUrl: "/admin" });
  }
  //TODO switch up logic to only evaluate authority of user on backend
  if (status == "loading") {
    return (
      <div className=" grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-black">Authenticating</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className=" grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-black">Fetching Data</span>
      </div>
    );
  }
  if (data?.events?.length == 0) {
    return (
      <div className="grid h-screen place-items-center font-extrabold bg-base-100  text-xl m-10 text-base-content">
        <Image src={ticketLogo} width={100} alt="ticket" height={100} />
        No Events
      </div>
    );
  }
  if (data?.events) {
    return (
      <div className="flex flex-row bg-base-100">
        {data?.events?.map((event, index) => {
          return (
            <EventInfo
              key={index}
              EventValidity={event?.EventValidity}
              EventName={event?.EventName}
              MobileContact={event?.MobileContact}
              EventOrganizer={event?.EventOrganizer}
            />
          );
        })}
      </div>
    );
  }
  if (data?.unauthorized) {
    return (
      <div className=" grid h-screen place-items-center bg-base-100">
        <Image src={error} alt="error" width={100} height={100} />
        <span className="text-black">
          You are not authorized to view this page
        </span>
        <button
          className="btn-accent btn gap-2 rounded text-accent-content"
          onClick={() => {
            signOut();
          }}
        >
          Sign in as admin
        </button>
      </div>
    );
  }
};
export default AdminPage;
