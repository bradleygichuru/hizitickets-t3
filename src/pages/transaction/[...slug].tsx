import Quixote from '../../components/Ticket';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { GetServerSideProps } from "next";
import Image from 'next/image';
import puff from '../../../public/puff.svg';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

const TransactionPage: NextPage<{ slug: string }> = (props) => {
  const [valid, setValid] = useState<boolean>(false);
  const checkTransactioMutation = trpc.useMutation("transactions.checkTransaction");
  useEffect(() => {
    const timer = setInterval(() => {
      checkTransactioMutation.mutateAsync({ merchantRequestID: props.slug }).then(res => {
        console.log(res.validity);
        
        if (res.validity == true) {
          setValid(true);
          clearInterval(timer);
        } else {
          setValid(false)
        }
      })
    }, 6000);

  }, [])
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
        <p className='text-white'> confirming transaction</p>

      </div>
    )
  }
  return (
    <div>
      <PDFDownloadLink document={<Quixote/>} fileName="ticket.pdf">here</PDFDownloadLink>
      <PDFViewer className='w-screen h-screen'>
        <Quixote/>
      </PDFViewer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let { slug } = context.query;

  slug = slug?.[0];
  console.log(slug);
  return {
    props: { slug },
  };
};

export default TransactionPage;   
