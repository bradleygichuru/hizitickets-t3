"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Layout from "@/components/layout";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [searchMethod, setSearchMethod] = useState<"receipt" | "emailPhone">("receipt");
  const [transaction, setTransaction] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiptFormData & EmailPhoneFormData>();

  const findTransactionMutation = useMutation({
    mutationFn: (data: { receiptNumber: string }) =>
      api.get("/transaction/findReceipt", { params: data }).then((res) => res.data),
  });

  const findByEmailPhoneMutation = useMutation({
    mutationFn: (data: { email: string; mobileNumber: string }) =>
      api.get("/transaction/findTransaction", { params: data }).then((res) => res.data),
  });

  const onSubmit = async (data: any) => {
    try {
      if (searchMethod === "receipt") {
        const res = await findTransactionMutation.mutateAsync(data);
        setTransaction(res);
        toast.success("Transaction found");
      } else {
        const res = await findByEmailPhoneMutation.mutateAsync(data);
        setTransaction(res);
        toast.success("Transaction found");
      }
    } catch (error) {
      toast.error("Transaction not found");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Receipt</h1>
        
        <Tabs value={searchMethod} onValueChange={(v) => setSearchMethod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receipt">By Receipt Number</TabsTrigger>
            <TabsTrigger value="emailPhone">By Email/Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="receipt">
            <Card>
              <CardHeader>
                <CardTitle>Search by Receipt Number</CardTitle>
                <CardDescription>Enter your receipt number to find your transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiptNumber">Receipt Number</Label>
                    <Input
                      id="receiptNumber"
                      placeholder="Enter receipt number"
                      {...register("receiptNumber")}
                    />
                    {errors.receiptNumber && (
                      <p className="text-sm text-red-500">{errors.receiptNumber.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={findTransactionMutation.isPending}>
                    {findTransactionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="emailPhone">
            <Card>
              <CardHeader>
                <CardTitle>Search by Email or Phone</CardTitle>
                <CardDescription>Enter your email or phone number</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      placeholder="254700000000"
                      {...register("mobileNumber")}
                    />
                  </div>
                  <Button type="submit" disabled={findByEmailPhoneMutation.isPending}>
                    {findByEmailPhoneMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {transaction && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Transaction Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Event:</strong> {transaction.EventName}</p>
                <p><strong>Tickets:</strong> {transaction.NumberOfTickets}</p>
                <p><strong>Amount:</strong> KES {transaction.TotalAmount}</p>
                <p><strong>Status:</strong> {transaction.Valid ? "Valid" : "Invalid"}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ReceiptPage;