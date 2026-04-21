import EventEntry from "./EventEntry";
import { Event } from "@prisma/client";

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
    <div className="flex flex-wrap gap-4 m-3">
      {props?.data?.map((val, index) => {
        return (
          <div key={index} className="flex-shrink-0">
            <EventEntry
              eventName={val.EventName}
              eventPosterUrl={getEventImage(val)}
            />
          </div>
        );
      })}
    </div>
  );
}