import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";

import { useToast } from "@chakra-ui/react";
const EventInfo = (props: {
  EventValidity: boolean;
  EventName: string;
  MobileContact: string;
  EventOrganizer: string;
}) => {
  const toast = useToast();
  const [eventValidity, setEventValidity] = useState<boolean>();

  const invalidateMutation = trpc.events.invalidateEvent.useMutation();
  const verifyMutation = trpc.events.verifyEvent.useMutation();
  useEffect(() => {
    setEventValidity(props?.EventValidity);
  }, []);
  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Verified: {props?.EventValidity}</div>
        <div className="stat-value">Event Name: {props?.EventName}</div>

        <div className="stat-title">
          Event Organizer: {props?.EventOrganizer}
        </div>
        <div className="stat-title">Mobile Contact: {props?.MobileContact}</div>
        <div className="stat-desc inline-flex">
          Valid{" "}
          <input
            type="checkbox"
            onChange={() => setEventValidity((prev) => !prev)}
            className="toggle mx-4 toggle-xs toggle-success"
            checked={eventValidity}
          />
        </div>
        <button
          className="m-2 btn btn-accent btn-wide"
          onClick={() => {
            invalidateMutation
              .mutateAsync({ eventName: props?.EventName })
              .then(({ verification }) => {
                if (verification == "successful") {
                  toast({
                    title: "Success.",
                    description: "Your event was verified successfully",
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Error.",
                    description: "There was an error verifying your event",
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                  });
                }
              });
          }}
        >
          invalidate
        </button>

        <button
          className="m-2 btn btn-accent btn-wide"
          onClick={() => {
            verifyMutation
              .mutateAsync({ eventName: props?.EventName })
              .then(({ verification }) => {
                if (verification == "successful") {
                  toast({
                    title: "Success.",
                    description: "Your event was verified successfully",
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Error.",
                    description: "There was an error verifying your event",
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                  });
                }
              });
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
};
export default EventInfo;
