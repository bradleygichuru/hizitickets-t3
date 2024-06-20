import type { NextPage } from "next";
import Layout from "../components/layout";
import { trpc } from "../utils/trpc";
import Section from "../components/section";
import ReactLoading from "react-loading";
import Image from "next/image";
import ticket from "../../public/ticket-svgrepo-com.svg";
import { Skeleton } from "@chakra-ui/react";
const EventsPage: NextPage = () => {
  const { data, isLoading, isFetched } =
    trpc.events.getVerifiedEvents.useQuery();
  console.log(data);
  return (
    <Layout>
      <Skeleton className="w-screen h-screen" isLoaded={isFetched}>
        {data?.events?.length == 0 ? (
          <div className="grid h-screen place-items-center font-extrabold bg-base-100  text-xl m-10 text-base-content">
            <Image src={ticket} width={200} alt="ticket" height={200} />
            No Events
          </div>
        ) : (
          <Section sectionName="Section" data={data?.events} />
        )}
      </Skeleton>
    </Layout>
  );
};
export default EventsPage;
