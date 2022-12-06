import TicketTemplate from "../../components/Ticket";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Event, Ticket, Transaction } from "@prisma/client";
import ReactLoading from "react-loading";

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
            Your {transaction?.ticketTypeTitle!} ticket
          </h3>
          {val.Scanned && (
            <div className="alert m-2 alert-warning shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
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
                  eventName={transaction?.event.EventName!}
                  imageData={val.ImageData!}
                  hash={val.TicketHash}
                  date={transaction?.event.EventDate!}
                  type={transaction?.ticketTypeTitle!}
                />
              }
              fileName={`ticket${index}.pdf`}
            >{`Download ticket ${index + 1}`}</PDFDownloadLink>
          </div>
        </div>
      </div>
    );
  });

  const checkTransactioMutation = trpc.useMutation(
    "transactions.checkTransaction"
  );
  const generateTicketsMutation = trpc.useMutation("ticket.generateTickets");

  useEffect(() => {
    const timer = setInterval(() => {
      checkTransactioMutation
        .mutateAsync({ merchantRequestID: props.slug })
        .then((res) => {
          console.log(res.validity);

          if (res.validity == true) {
            setValid(true);
            setTransactionId(res.transactionId);

            generateTicketsMutation
              .mutateAsync({ transactionId: res.transactionId! })
              .then((res) => {
                setTransaction(res?.transaction);
              });
            clearInterval(timer);
          } else {
            setValid(false);
          }
        });
      return () => clearInterval(timer);
    }, 6000);
  }, []);
  if (valid == false) {
    return (
      <div className="bg-base-100 grid h-screen place-items-center">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <p className="text-black"> confirming transaction</p>
      </div>
    );
  }
  if (generateTicketPdfs == undefined) {
    return (
      <div className="bg-primary grid h-screen place-items-center">
        <ReactLoading type="spin" color="#0000FF" height={100} width={100} />
        <p className="text-black">generating tickets</p>
      </div>
    );
  }
  return (
    <div data-theme="light">
      <h2 className="text-3xl m-2 text-extrabold text-center">
        Download your tickets
      </h2>
      <div className="overflow-auto  h-screen flex-wrap flex flex-row">
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
