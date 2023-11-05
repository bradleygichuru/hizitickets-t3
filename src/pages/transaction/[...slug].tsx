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

const TransactionPage: NextPage<{ slug: string }> = (props) => {
  const [valid, setValid] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>();
  const [transaction, setTransaction] = useState<{
    event: Event;
    ticketTypeTitle: string;
    TransactionId: string;
    tickets: Ticket[];
  } | null>();

  const generateTicketPdfs = transaction?.tickets.map((val, index) => {
    return (
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
    );
  });

  const checkTransactioMutation =
    trpc.transaction.checkTransaction.useMutation();
  const generateTicketsMutation = trpc.ticket.generateTickets.useMutation();
  const toast = useToast();
  useEffect(() => {
    const timer = setInterval(() => {
      checkTransactioMutation
        .mutateAsync({ merchantRequestID: props.slug })
        .then((res) => {
          console.log(res.validity);

          if (res.validity == true && res.cancelled == false) {
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
                setTransaction(res?.transaction);
              });
            setValid(true);
            clearInterval(timer);
          }
          if (res.cancelled == true && res.validity == false) {
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
      <div className="grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <p className="text-black"> confirming transaction</p>
      </div>
    );
  }
  if (generateTicketPdfs == undefined && valid == true) {
    return (
      <div className="grid h-screen place-items-center bg-base-100">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <p className="text-black">generating tickets</p>
      </div>
    );
  }
  return (
    <div data-theme="light">
      <h2 className="text-extrabold m-2 text-center text-3xl">
        Download your tickets
      </h2>
      <div className="flex  h-screen flex-row flex-wrap overflow-auto">
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
