import Image from "next/image";
import Link from "next/link";
import React from "react";
export default function EventEntry(props: {
  eventName: string;
  eventPosterUrl: string;
}) {
  console.log(props);
  return (
    <Link href={`/ticket/${props.eventName}`} passHref>
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure>
          <Image
            width={384}
            height={100}
            src={`${props.eventPosterUrl}`}
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{props.eventName}</h2>
        </div>
      </div>
    </Link>
  );
}
{
  /*<Link href={`/ticket/${props.eventName}`} passHref>
      <div className="group relative m-3 mb-10 flex-auto rounded-lg bg-neutral p-0">
        <div className="min-h-80 aspect-w-1  aspect-h-1 lg:aspect-none w-full overflow-hidden rounded-md group-hover:opacity-75 lg:h-80">
          <img
            src={`${props.eventPosterUrl}`}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full" //TODO use next/image here
          />
        </div>
        <div className="m-1 flex justify-between">
          <div>
            <h3 className="rounded-lg text-neutral-content p-1 text-sm">
              <span
                aria-hidden="true"
                className=" absolute inset-0 font-sans text-sm font-bold "
              />
              {props.eventName}
            </h3>
          </div>
        </div>
      </div>
    </Link>*/
}
