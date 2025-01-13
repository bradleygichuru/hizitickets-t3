import TicketTemplate from "../../components/Ticket";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { GetServerSideProps } from "next";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Event, Ticket } from "@prisma/client";
import ReactLoading from "react-loading";
import Router from "next/router";
import { useToast } from "@chakra-ui/react";
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
const TransactionPage: NextPage<{ slug: string }> = (props) => {
  const generateTicketsMutation = trpc.ticket.generateTickets.useMutation();

  const [valid, setValid] = useState<boolean>(false);
  const [generated, setGenerated] = useState(false);
  const [transactionId, setTransactionId] = useState<string>();

  const [dots, setDots] = useState(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);
  const generateTicketPdfs =
    generateTicketsMutation?.data?.transaction?.tickets.map((val, index) => {
      return (
        <Card key={val.TicketId} className="flex flex-col">
          <CardHeader>
            <CardTitle>
              {generateTicketsMutation?.data?.transaction?.event.EventName}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {new Date(
                    generateTicketsMutation?.data?.transaction?.event
                      ?.EventDate as Date
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>
                  {
                    generateTicketsMutation?.data?.transaction?.event
                      .EventLocation
                  }
                </span>
              </div>
              <div>
                <strong>Ticket Type:</strong>{" "}
                {generateTicketsMutation?.data?.transaction?.ticketTypeTitle}
              </div>
              <div>
                <strong>Purchased:</strong>{" "}
                {new Date(
                  generateTicketsMutation?.data?.transaction
                    ?.transactionDate as string
                ).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <PDFDownloadLink
                key={index}
                document={
                  <TicketTemplate
                    eventName={
                      generateTicketsMutation?.data?.transaction?.event
                        ?.EventName as string
                    }
                    imageData={val?.ImageData}
                    hash={val.TicketHash}
                    date={
                      generateTicketsMutation?.data?.transaction?.event
                        ?.EventDate as Date
                    }
                    type={
                      generateTicketsMutation?.data?.transaction
                        ?.ticketTypeTitle as string
                    }
                  />
                }
                fileName={`ticket${index}.pdf`}
              >{`Download ticket ${index + 1}`}</PDFDownloadLink>
            </Button>
          </CardFooter>
        </Card>
      );
    });

  const checkTransactionMutation =
    trpc.transaction.checkTransaction.useMutation();
  const toast = useToast();
  useEffect(() => {
    const timer = setInterval(() => {
      checkTransactionMutation
        .mutateAsync({ merchantRequestID: props.slug })
        .then((res) => {
          console.log(res.validity);

          if (res?.completed === true && res?.validity === true) {
            toast({
              title: "Transaction was valid",
              description: res?.mpesaResDescription,
              status: "info",
              isClosable: true,
              duration: 9000,
            });
            setValid(true);
            setTransactionId(res.transactionId);

            generateTicketsMutation
              .mutateAsync({ transactionId: res?.transactionId as string })
              .then((res) => {
                //setTransaction(res?.transaction);
              });
            setValid(true);
            clearInterval(timer);
          }
          if (res.cancelled === true) {
            toast({
              title: "Transaction was not valid",
              description: res?.mpesaResDescription,
              status: "info",
              isClosable: true,
              duration: 9000,
            });
            setValid(true);
            clearInterval(timer);
            Router.push("/events");
          }
        });
      return () => clearInterval(timer);
    }, 6000);
  }, []);
  if (valid == false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Transaction in Progress
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we confirm your transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-lg font-medium text-center">
              Confirming your transaction{dots}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              This may take a few moments. Please do not close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (generateTicketPdfs == undefined && valid == true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Generation in Progress
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we generate your tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-lg font-medium text-center">
              Generating your tickets{dots}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              This may take a few moments. Please do not close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Tickets</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {generateTicketPdfs}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let { slug } = context.query;

  slug = slug?.[0];
  console.log(slug);
  return {
    props: { slug },
  };
};

export default TransactionPage;
{
  /*
<div key={index} className="card m-3 w-96 bg-base-100 shadow-xl">
        <div className="card-body  items-center text-center">
          <h3 className="card-title">
            Your {transaction?.ticketTypeTitle} ticket
          </h3>
          {val.Scanned && (
            <div className="alert alert-warning m-2 shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 flex-shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  Warning: This ticket has been scanned. You cannot produce a
                  ticket more than once at the gate
                </span>
              </div>
            </div>
          )}
          <div className="card-actions">
            <PDFDownloadLink
              className="btn"
              key={index}
              document={
                <TicketTemplate
                  eventName={transaction?.event?.EventName}
                  imageData={val?.ImageData}
                  hash={val.TicketHash}
                  date={transaction?.event?.EventDate}
                  type={transaction?.ticketTypeTitle}
                />
              }
              fileName={`ticket${index}.pdf`}
            >{`Download ticket ${index + 1}`}</PDFDownloadLink>
          </div>
        </div>
      </div>
*/
}
