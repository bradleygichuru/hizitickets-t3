import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryProvider } from "../components/QueryClientProvider";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <QueryProvider>
          <Component {...pageProps} />
          <SpeedInsights/>
          <Analytics/>
        </QueryProvider>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default MyApp;