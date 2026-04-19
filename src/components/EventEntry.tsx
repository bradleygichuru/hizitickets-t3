import Image from "next/image";
import Link from "next/link";
import React from "react";

function isBase64Image(str: string): boolean {
  return str && str.startsWith("data:image");
}

export default function EventEntry(props: {
  eventName: string;
  eventPosterUrl: string;
}) {
  console.log(props);
  const isBase64 = isBase64Image(props.eventPosterUrl);
  
  return (
    <Link
      href={`/ticket/${props.eventName}`}
      className="bg-white rounded-lg shadow-md overflow-hidden"
      passHref
    >
      {isBase64 ? (
        <img
          src={props.eventPosterUrl}
          alt={props.eventName}
          className="w-full h-48 object-cover"
        />
      ) : (
        <Image
          src={props.eventPosterUrl}
          alt={props.eventName}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{props.eventName}</h2>
        <p className="text-gray-600 mb-2">{""}</p>
        <p className="text-gray-600">{""}</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Book Tickets
        </button>
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
