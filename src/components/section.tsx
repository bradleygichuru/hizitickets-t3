import EventEntry from "./EventEntry";
import { Event } from "@prisma/client";
import { BiCaretDownCircle } from "react-icons/bi";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import { Key } from "react";
import { Wrap, WrapItem } from "@chakra-ui/react";

function getEventImage(event: Event): string {
  if (event.EventPosterData) {
    return event.EventPosterData;
  }
  return event.EventPosterUrl || "";
}

export default function Section(props: {
  data: Event[] | undefined;
  sectionName: string;
}) {
  return (
    <Wrap className="m-3 ">
      {props?.data?.map((val, index) => {
        return (
          <WrapItem key={index}>
            <EventEntry
              eventName={val.EventName}
              eventPosterUrl={getEventImage(val)}
            />
          </WrapItem>
        );
      })}
    </Wrap>
  );
}
