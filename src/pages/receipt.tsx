import { useState } from "react";
import type { NextPage } from "next";
import Layout from "../components/layout";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, useToast, Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptDocument from "../components/Receipt";
import { Loader2, Download, Receipt } from "lucide-react";

const receiptSchema = z.object({
  receiptNumber: z.string().min(1, "Receipt number is required"),
});

const emailPhoneSchema = z.object({
  email: z.string().email("Valid email is required"),
  mobileNumber: z.string().min(9, "Phone number is required"),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;
type EmailPhoneFormData = z.infer<typeof emailPhoneSchema>;

const ReceiptPage: NextPage = () => {
  const toast = useToast();
  const [searchMethod, setSearchMethod] = useState<"receipt" | "emailPhone">("receipt");
  const [transaction, setTransaction] = useState<any>(null);

  const {
    register: registerReceipt,
    handleSubmit: handleReceiptSubmit,
    formState: { errors: receiptErrors },
    reset: resetReceipt,
  } = useForm<ReceiptFormData>();

  const {
    register: registerEmailPhone,
    handleSubmit: handleEmailPhoneSubmit,
    formState: { errors: emailPhoneErrors },
    reset: resetEmailPhone,
  } = useForm<EmailPhoneFormData>();

  const findReceiptMutation = useMutation({
    mutationFn: (data: any) =>
      api.post("/transaction/findReceipt", data).then((res) => res.data),
  });

  const onReceiptSubmit = async (data: ReceiptFormData) => {
    try {
      const res = await findReceiptMutation.mutateAsync({
        searchBy: "receipt",
        receiptNumber: data.receiptNumber,
      });
      if (res?.transaction) {
        setTransaction(res.transaction);
        toast({ title: "Found!", description: "Transaction found", status: "success", duration: 3000 });
      } else {
        toast({ title: "Not Found", description: "No transaction with that receipt number", status: "error", duration: 5000 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Something went wrong", status: "error", duration: 5000 });
    }
  };

  const onEmailPhoneSubmit = async (data: EmailPhoneFormData) => {
    try {
      const res = await findReceiptMutation.mutateAsync({
        searchBy: "emailPhone",
        email: data.email,
        mobileNumber: data.mobileNumber,
      });
      if (res?.transaction) {
        setTransaction(res.transaction);
        toast({ title: "Found!", description: "Transaction found", status: "success", duration: 3000 });
      } else {
        toast({ title: "Not Found", description: "No transaction with that email and phone", status: "error", duration: 5000 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Something went wrong", status: "error", duration: 5000 });
    }
  };

  const getReceiptNumber = () => {
    return transaction?.paygateTxIdIn || transaction?.paygateTxIdOut || transaction?.MerchantRequestID || "N/A";
  };

  const getPricePerTicket = () => {
    if (!transaction?.NumberOfTickets || !transaction?.TotalAmount) return 0;
    return Number(transaction.TotalAmount) / transaction.NumberOfTickets;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Download Receipt</h1>
        </div>

        {!transaction ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Tabs variant="soft-rounded" colorScheme="teal" onChange={(index) => {
              setSearchMethod(index === 0 ? "receipt" : "emailPhone");
              setTransaction(null);
              resetReceipt();
              resetEmailPhone();
            }}>
              <TabList className="mb-4">
                <Tab>By Receipt Number</Tab>
                <Tab>By Email & Phone</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                <form onSubmit={handleReceiptSubmit(onReceiptSubmit)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Receipt Number</label>
                    <input
                      type="text"
                      placeholder="Enter receipt number (txid)"
                      className="w-full p-3 border rounded-lg"
                      {...registerReceipt("receiptNumber", { required: true })}
                    />
                    {receiptErrors.receiptNumber && (
                      <p className="text-red-500 text-sm mt-1">{receiptErrors.receiptNumber.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    disabled={findReceiptMutation.isPending}
                    className="w-full"
                  >
                    {findReceiptMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    Search
                  </Button>
                </form>
              </TabPanel>

                <TabPanel>
                  <form onSubmit={handleEmailPhoneSubmit(onEmailPhoneSubmit)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full p-3 border rounded-lg"
                      {...registerEmailPhone("email", { required: true })}
                    />
                    {emailPhoneErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{emailPhoneErrors.email.message}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="712345678"
                      className="w-full p-3 border rounded-lg"
                      {...registerEmailPhone("mobileNumber", { required: true, minLength: 9 })}
                    />
                    {emailPhoneErrors.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">{emailPhoneErrors.mobileNumber.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    disabled={findReceiptMutation.isPending}
                    className="w-full"
                  >
                    {findReceiptMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    Search
                  </Button>
                </form>
              </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800">Transaction Found!</h3>
              <p className="text-sm text-green-600">
                {transaction.event?.EventName} - KES {transaction.TotalAmount}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">{transaction.event?.EventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(transaction.transactionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets:</span>
                <span className="font-medium">{transaction.NumberOfTickets} x {transaction.ticketTypeTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-lg">KES {transaction.TotalAmount}</span>
              </div>
            </div>

            <PDFDownloadLink
              document={
                <ReceiptDocument
                  transactionId={transaction.TransactionId}
                  receiptNumber={getReceiptNumber()}
                  transactionDate={new Date(transaction.transactionDate).toLocaleDateString()}
                  eventName={transaction.event?.EventName}
                  eventLocation={transaction.event?.EventLocation}
                  eventDate={new Date(transaction.event?.EventDate).toLocaleDateString()}
                  customerEmail={transaction.email}
                  customerPhone={transaction.MobileNumber}
                  ticketType={transaction.ticketTypeTitle}
                  quantity={transaction.NumberOfTickets}
                  pricePerTicket={getPricePerTicket()}
                  totalAmount={Number(transaction.TotalAmount)}
                  paymentMethod={transaction.TransactionMethod}
                />
              }
              fileName={`receipt-${getReceiptNumber()}.pdf`}
            >
              {({ loading }) => (
                <Button colorScheme="teal" className="w-full" disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? "Preparing..." : "Download Receipt PDF"}
                </Button>
              )}
            </PDFDownloadLink>

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setTransaction(null)}
            >
              Search Again
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReceiptPage;