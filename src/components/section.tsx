import EventEntry from "./EventEntry";
import { Event } from "@prisma/client";
import { BiCaretDownCircle } from "react-icons/bi";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import {
  ReactFragment,
  ReactPortal,
  ReactElement,
  JSXElementConstructor,
} from "react";
import { Key } from "react";
export default function Section(props: { data: Event[]; sectionName: string }) {
  return (
    <div className="content-center flex flex-col ">
      <div className="container flex sm:w-auto sm:ml-24 w-auto ml-12 mt-8">
        <span className="font-sans text-sm font-bold ">
          {props.sectionName}
        </span>
      </div>
      <div className="bg-primary rounded-xl p-3 grid grid-cols-1 sm:grid sm:grid-rows-1 sm:grid-cols-4 justify-center  sm:ml-24 sm:mt-20 mt-20 w-auto ml-10 mr-10 ">
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
