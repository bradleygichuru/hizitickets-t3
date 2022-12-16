import type { NextPage } from "next";
import Layout from "../components/layout";

import Router from "next/router";
import { trpc } from "../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
const FormSchema = z.object({
  phoneNumber: z.string(),
  ticketType: z.string(),
  eventName: z.string(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

const RecoverTicket: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormSchemaType>();
  const findTicketsMutation = trpc.ticket.findMerchantId.useMutation();
  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    const res = await findTicketsMutation.mutateAsync({
      phoneNumber: data.phoneNumber,
      eventName: data.eventName,
      ticketType: data.ticketType,
    });
    if (res) {
      console.log(res);
     // Router.push(`/transaction/${res[0]?.MerchantRequestID}`);
    }
  };
  return (
    <Layout>
      <div className="my-2 mx-2 h-screen rounded bg-base-100 p-10">
        <h1 className="ml-4 mb-2 grid text-3xl font-medium leading-tight text-accent">
          Regenerate Lost Tickets
        </h1>
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Information needed to regenerate tickets
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <form
              className="form-control p-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="label">
                <span className="label-text">
                  The ticket purchasers mobile number
                </span>
              </label>
              <label className="input-group-md input-group input-group-vertical m-2">
                <span>number</span>
                <input
                  type="text"
                  placeholder="+2547 xxx xxxxx"
                  className="input-bordered input"
                  {...register("phoneNumber", { required: true })}
                />
              </label>

              {errors.phoneNumber && (
                <label className="label">
                  <span className="text-red-900">This field is required</span>
                </label>
              )}
              <label className="label">
                <span className="label-text">Ticket type</span>
              </label>
              <label className="input-group-md input-group input-group-vertical m-2">
                <span>name</span>
                <input
                  type="text"
                  placeholder="Group ticket"
                  className="input-bordered input"
                  {...register("ticketType", { required: true })}
                />
              </label>

              {errors.ticketType && (
                <label className="label">
                  <span className="text-red-900">This field is required</span>
                </label>
              )}

              <label className="label">
                <span className="label-text">Event Name</span>
              </label>
              <label className="input-group-md input-group input-group-vertical m-2">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="eg. OktoberFest "
                  className="input-bordered input"
                  {...register("eventName", { required: true })}
                />
              </label>

              {errors.eventName && (
                <label className="label">
                  <span className="text-red-900">This field is required</span>
                </label>
              )}
              <button type="submit" className="btn m-2 bg-accent">
                submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default RecoverTicket;
