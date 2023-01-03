import { trpc } from "../utils/trpc";
import Image from "next/image";
import error from "../../public/error.svg";
import { useSession, signIn } from "next-auth/react";
import ReactLoading from "react-loading";
import EventInfo from "../components/EventValidationEntry";
const AdminPage = () => {
  const { data: session, status } = useSession();
  const { data, isLoading } = trpc.events.getEvents.useQuery();
  console.log(session)
  if (status == "unauthenticated") {
    signIn();
  }

  if (status != "authenticated") {
    return (
      <div className=" grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-black">Authenticating</span>
      </div>
    );
  }
  if ((session?.user?.email == "bradleygichuru@gmail.com") || (session?.user?.email == "jasonmwai.k@gmail.com") ) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        {data?.events?.map((event, index) => {
          return (
            <EventInfo key={index}
              EventValidity={event?.EventValidity}
              EventName={event?.EventName}
            />
          );
        })}
      </div>
    );
  }
  return (
    <div className=" grid h-screen place-items-center bg-base-100">
      <Image src={error} alt="error" width={100} height={100} />
      <span className="text-black">
        You are not authorized to view this page
      </span>
    </div>
  );
};
export default AdminPage;
