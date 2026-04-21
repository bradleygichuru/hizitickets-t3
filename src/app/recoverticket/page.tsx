"use client";

import { useState } from "react";
import type { NextPage } from "next";
import Layout from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FormSchema = z.object({
  mpesaTransCode: z.string(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

const RecoverTicket: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchemaType>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const findTransactionMutation = useMutation({
    mutationFn: (data: { mpesaTransCode: string }) =>
      api.get("/transaction/findTransaction", { params: data }).then((res) => res.data),
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await findTransactionMutation.mutateAsync({
        mpesaTransCode: data?.mpesaTransCode,
      });
      toast.success("Transaction found", {
        description: "Redirecting to ticket download...",
      });
      // TODO: redirect to transaction page
      window.location.href = `/transaction/${res?.TransactionId}`;
    } catch (error) {
      toast.error("Transaction not found", {
        description: "Please check your M-Pesa code and try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-center">Recover Your Ticket</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Enter your M-Pesa confirmation code to recover your ticket
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mpesaTransCode">M-Pesa Confirmation Code</Label>
              <Input
                id="mpesaTransCode"
                placeholder="e.g., RA50XXXXX"
                {...register("mpesaTransCode", { required: true })}
              />
              {errors.mpesaTransCode && (
                <p className="text-sm text-red-500">This field is required</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Searching..." : "Recover Ticket"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Can&apos;t find your ticket?</p>
            <p>Contact us at:</p>
            <p>+254768085236, +254794292432</p>
            <p>hizitickets@gmail.com</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecoverTicket;