import type { NextPage } from "next";
import Layout from "../components/layout";
import { trpc } from "../utils/trpc";
import Section from "../components/section";
import ReactLoading from "react-loading";
import Image from "next/image";
import ticket from "../../public/ticket-svgrepo-com.svg";
const EventsPage: NextPage = () => {
  const { data, isLoading } = trpc.events.getVerifiedEvents.useQuery();
  console.log(data);
  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center bg-base-100 text-base-content">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
      </div>
    );
  }
  if (data?.events?.length == 0) {
    return (
      <Layout>
        <div className="grid h-screen place-items-center font-extrabold bg-base-100  text-xl m-10 text-base-content">
          <Image src={ticket} width={200} alt="ticket" height={200} />
          No Events
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Section sectionName="Section" data={data?.events} />
    </Layout>
  );
};
export default EventsPage;
