import type { NextPage } from "next";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import Layout from "../components/layout";
import Link from "next/link";
const HelpPage: NextPage = () => {
  return (
    <Layout>
      <div className="bg-primary my-2 h-screen mx-2 rounded p-10">
        <h1 className="font-medium grid text-accent leading-tight text-5xl mx-2  mb-2">
          FAQ
        </h1>
        <Accordion allowToggle p="10px">
          <AccordionItem border="2px" borderRadius="6px" m="5px">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Need help buying tickets?
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel mb={4} pb={4}>
              <div className="divider"></div>
              <p>
                1. Click on the event you wish to purchase tickets for on the{" "}
                <Link href="/events" passHref>
                  <a className="link link-primary">events page</a>
                </Link>
                <br></br>
                2. Purchase tickets on the page you will be redirected to and
                wait for transaction confirmation before your tickets are
                generated
                <br></br>
                3. Download your tickets
              </p>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="2px" borderRadius="6px" m="5px">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  lost your ticket?
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel mb={4} pb={4}>
              <div className="divider"></div>
              Regenerate lost tickets{" "}
              <Link href="/recoverticket" passHref>
                <a className="link link-primary">here</a>
              </Link>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};
export default HelpPage;
