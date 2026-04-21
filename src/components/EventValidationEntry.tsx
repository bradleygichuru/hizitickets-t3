import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import { toast } from "sonner";

const EventInfo = (props: {
  EventValidity: boolean;
  EventName: string;
  MobileContact: string;
  EventOrganizer: string;
}) => {
  const [eventValidity, setEventValidity] = useState<boolean>();
  const makeDemoEventMutation = useMutation({
    mutationFn: (data: { eventName: string }) =>
      api.post("/events/setDemoEvent", data).then((res) => res.data),
  });

  const unMakeDemoEventMutation = useMutation({
    mutationFn: (data: { eventName: string }) =>
      api.post("/events/unDemoEvent", data).then((res) => res.data),
  });
  const invalidateMutation = useMutation({
    mutationFn: (data: { eventName: string }) =>
      api.post("/events/invalidateEvent", data).then((res) => res.data),
  });
  const verifyMutation = useMutation({
    mutationFn: (data: { eventName: string }) =>
      api.post("/events/verifyEvent", data).then((res) => res.data),
  });
  useEffect(() => {
    setEventValidity(props?.EventValidity);
  }, []);
  return (
    <div className={props.EventValidity?"stats shadow m-3 bg-green":"stats shadow m-3 bg-rose-500"}>
      <div className="stat">
        <div className="stat-title">
          
        </div>
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
            invalidateMutation.mutateAsync({ eventName: props?.EventName })
              .then(({ verification }) => {
                if (verification == "successful") {
                  toast.success("Success", {
                    description: "Your event was invalidated successfully",
                  });
                } else {
                  toast.error("Error", {
                    description: "There was an error verifying your event",
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
            verifyMutation.mutateAsync({ eventName: props?.EventName })
              .then(({ verification }) => {
                if (verification == "successful") {
                  toast.success("Success", {
                    description: "Your event was verified successfully",
                  });
                } else {
                  toast.error("Error", {
                    description: "There was an error verifying your event",
                  });
                }
              });
          }}
        >
          Verify
        </button>

        <button
          className="m-2 btn btn-accent btn-wide"
          onClick={() => {
            makeDemoEventMutation.mutateAsync({ eventName: props?.EventName })
              .then((data) => {
                if (data.status === "successful") {
                  toast.success("Success", {
                    description: "Converted to demo event",
                  });
                } else {
                  toast.error("Error", {
                    description: "Error converting to demo mode",
                  });
                }
              });
          }}
        >
          Activate Demo mode
        </button>
        <button
          className="m-2 btn btn-accent btn-wide"
          onClick={() => {
            unMakeDemoEventMutation.mutateAsync({ eventName: props?.EventName })
              .then((data) => {
                if (data.status === "successful") {
                  toast.success("Success", {
                    description: "Removed deactivated mode",
                  });
                } else {
                  toast.error("Error", {
                    description: "Error deactivating demo mode",
                  });
                }
              });
          }}
        >
          Deactivate Demo mode
        </button>
      </div>
    </div>
  );
};
export default EventInfo;