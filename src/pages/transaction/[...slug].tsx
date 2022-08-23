import TicketTemplate from "../../components/Ticket";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { GetServerSideProps } from "next";
import Image from "next/image";
import puff from "../../../public/puff.svg";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Event, Ticket, Transaction } from "@prisma/client";
import generateQR from "../../utils/base64gen";

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
    let imagedata;
    generateQR(val.TicketHash).then((data) => (imagedata = data));
    return (
      
        <div key={index} className="card m-3 w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              Your {transaction?.ticketTypeTitle!} ticket
            </h2>
            <a className="btn">
              <PDFDownloadLink
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
                fileName="ticket.pdf"
              >{`ticket ${index}`}</PDFDownloadLink>
            </a>

           
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
    }, 6000);
  }, []);
  if (valid == false) {
    return (
      <div className="bg-black grid h-screen place-items-center">
        <Image
          src={puff}
          width={64}
          height={64}
          alt="loading..."
          className=""
        />
        <p className="text-white"> confirming transaction</p>
      </div>
    );
  }
  return <div data-theme="light" className="overflow-auto  h-screen flex-wrap flex flex-row">{generateTicketPdfs}</div>;
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
