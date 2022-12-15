import EventEntry from "./EventEntry";
import { Event } from "@prisma/client";
import { BiCaretDownCircle } from "react-icons/bi";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import { Key } from "react";
export default function Section(props: { data: Event[]; sectionName: string }) {
  return (
    <div className="flex flex-col content-center ">
      <div className="container ml-12 mt-8 flex w-auto sm:ml-24 sm:w-auto">
        <span className="font-sans text-sm font-bold ">
          {props.sectionName}
        </span>
      </div>
      <div className="mt-20 ml-10 mr-10 grid w-auto grid-cols-1 justify-center rounded-xl bg-base-100  p-3 sm:ml-24 sm:mt-20 sm:grid sm:grid-cols-4 sm:grid-rows-1 ">
        {props.data.map((val, index) => {
          return (
            <EventEntry
              key={index}
              eventName={val.EventName}
              eventPosterUrl={val.EventPosterUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
