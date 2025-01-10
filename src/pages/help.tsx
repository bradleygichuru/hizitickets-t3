import type { NextPage } from "next";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Layout from "../components/layout";
import Link from "next/link";
const faqs = [
  {
    question: "Need help buying tickets?",
    answer:
      "1. Click on the event you wish to purchase tickets for on the events page 2. Purchase tickets on the page you will be redirected to and wait for transaction confirmation before your tickets are generated 3. Download your tickets",
  },
  {
    question: "lost your ticket?",
    answer:
      "To Regenerate lost tickets contact +254768085236, +254794292432 or email hizitickets@gmail.com",
  },
];
const HelpPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h1>

        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-2xl mx-auto"
        >
          {filteredFaqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredFaqs.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No FAQs found matching your search. Please try a different term.
          </p>
        )}
      </div>
    </Layout>
  );
};
export default HelpPage;
