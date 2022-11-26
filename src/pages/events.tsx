import { NextPage } from "next";
import Layout from "../components/layout";
import { trpc } from "../utils/trpc";
import Section from "../components/section";
import ReactLoading from "react-loading";
const EventsPage: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["event.getEvents"]);
  console.log(data);
  if (isLoading) {
    return (
      <div className="bg-base-100 text-base-content grid h-screen place-items-center">
        <ReactLoading type="spin" color="#0000FF" height={100} width={50} />
      </div>
    );
  }
  return (
    <Layout>
      <Section sectionName="Section" data={data?.events!} />
    </Layout>
  );
};
export default EventsPage;
