"use client";

import { useEffect, useState } from "react";
import TicketTemplate from "@/components/Ticket";
import { useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReactLoading from "react-loading";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, MapPin } from "lucide-react";

const TransactionPage = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.slug?.[0] as string;

  const generateTicketsMutation = useMutation({
    mutationFn: (data: { transactionId: string }) =>
      api.post("/ticket/generateTickets", data).then((res) => res.data),
  });

  const [valid, setValid] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [dots, setDots] = useState(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (transactionId) {
      generateTicketsMutation.mutate({ transactionId });
    }
  }, [transactionId]);

  if (generateTicketsMutation.isPending) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <span className="text-foreground">Loading{dots}</span>
      </div>
    );
  }

  if (generateTicketsMutation.isError) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <span className="text-foreground text-red-500">Error loading transaction</span>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { data } = generateTicketsMutation.data || {};
  const tickets = data?.transaction?.tickets || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Tickets</h1>
      
      <div className="grid gap-6">
        {tickets.map((val: any, index: number) => (
          <Card key={val.TicketId} className="flex flex-col">
            <CardHeader>
              <CardTitle>
                {data?.transaction?.event.EventName}
              </CardTitle>
              <CardDescription>
                Ticket #{index + 1}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(
                      data?.transaction?.event?.EventDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{data?.transaction?.event.EventLocation}</span>
                </div>
                <div>
                  <strong>Ticket Type:</strong>{" "}
                  {data?.transaction?.ticketTypeTitle}
                </div>
                <div>
                  <strong>Purchased:</strong>{" "}
                  {new Date(
                    data?.transaction?.transactionDate
                  ).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <PDFDownloadLink
                document={
                  <TicketTemplate
                    eventName={data?.transaction?.event?.EventName as string}
                    imageData={val?.ImageData}
                    hash={val.TicketHash}
                    date={data?.transaction?.event?.EventDate as Date}
                    type={data?.transaction?.ticketTypeTitle as string}
                  />
                }
                className="w-full"
              >
                {({ loading }) =>
                  loading ? (
                    <Button disabled className="w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </Button>
                  ) : (
                    <Button className="w-full">
                      Download Ticket
                    </Button>
                  )
                }
              </PDFDownloadLink>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TransactionPage;