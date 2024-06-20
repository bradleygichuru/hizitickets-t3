import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { Analytics } from "@vercel/analytics/react"
import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (

    <SessionProvider session={session}>
      <ChakraProvider>
        <Component {...pageProps} />
        <Analytics/>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
