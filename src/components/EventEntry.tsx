import Image from "next/image";
import Link from "next/link";

function isBase64Image(str: string): boolean {
  return !!str && str.startsWith("data:image");
}

export default function EventEntry(props: {
  eventName: string;
  eventPosterUrl: string;
}) {
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
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Book Tickets
        </button>
      </div>
    </Link>
  );
}