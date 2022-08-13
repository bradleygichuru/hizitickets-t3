import { NextPage } from "next";
import Layout from "../components/layout";
import { trpc } from "../utils/trpc";
import Section from "../components/section";
import EventEntry from "../components/EventEntry";
import Image from "next/image";
import puff from '../../public/puff.svg'

const EventsPage: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["event.getEvents"]);
  console.log(data);
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
        Loading
      </div>
    )
  }
  return (
    <Layout>
      <Section sectionName="Section" data={data?.events!} />
    </Layout>
  );
};
export default EventsPage;
