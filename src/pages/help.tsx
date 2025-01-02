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
      <div className="my-2 mx-2 h-screen rounded bg-base-100 p-10">
        <h1 className="mx-2 mb-2 grid text-5xl font-medium leading-tight text-accent">
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
                <Link className="link-primary link" href="/events" passHref>
                  events page
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
              To Regenerate lost tickets contact +254768085236, +254794292432 or
              email hizitickets@gmail.com
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};
export default HelpPage;
