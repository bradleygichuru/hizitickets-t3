import { NextPage } from "next";
import Layout from "../components/layout";
import { trpc } from "../utils/trpc";
import Section from "../components/section";
import EventEntry from "../components/EventEntry";

const EventsPage: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["event.getEvents"]);
  console.log(data);
  if(isLoading){
    return(
      <p>loading...</p>
    )
  }
  return (
    <Layout>
      <Section sectionName="Section" data={data?.events!} />
    </Layout>
  );
};
export default EventsPage;
