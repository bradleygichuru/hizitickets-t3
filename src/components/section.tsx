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
  if (!props?.data || props.data.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8">
      {props.data.map((val, index) => (
        <EventEntry
          key={val.EventId || index}
          eventName={val.EventName}
          eventPosterUrl={getEventImage(val)}
        />
      ))}
    </div>
  );
}
