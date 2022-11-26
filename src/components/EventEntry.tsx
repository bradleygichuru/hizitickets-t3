import Link from "next/link";
import React from "react";
export default function EventEntry(props: {
  eventName: string;
  eventPosterUrl: string;
}) {
  console.log(props);
  return (
    <Link href={`/ticket/${props.eventName}`} passHref>
      <div className="group relative p-0 m-3 mb-10 rounded-lg bg-neutral flex-auto">
        <div className="w-full min-h-80  aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
          <img
            src={`${props.eventPosterUrl}`}
            className="w-full h-full object-center object-cover lg:w-full lg:h-full" //TODO use next/image here
          />
        </div>
        <div className="m-1 flex justify-between">
          <div>
            <h3 className="text-sm  rounded-lg p-1">
              <a className="text-neutral-content">
                <span
                  aria-hidden="true"
                  className=" absolute inset-0 font-sans text-sm font-bold "
                />
                {props.eventName}
              </a>
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
