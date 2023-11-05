import type { NextPage } from "next";
import Layout from "../components/layout";

import Router from "next/router";
import { trpc } from "../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
const FormSchema = z.object({
  mpesaTransCode: z.string(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

const RecoverTicket: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormSchemaType>();
  const findTransactionMutation =
    trpc.transaction.findTransaction.useMutation();
  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    const res = await findTransactionMutation.mutateAsync({
      mpesaTransCode: data?.mpesaTransCode,
    });
    if (res) {
      Router.push(`/transaction/${res?.transaction?.MerchantRequestID}`);
    } else {
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
                <span className="label-text">Receipt Number</span>
              </label>
              <label className="input-group-md input-group input-group-vertical m-2">
                <span></span>
                <input
                  type="text"
                  placeholder="+2547 xxx xxxxx"
                  className="input-bordered input"
                  {...register("mpesaTransCode", { required: true })}
                />
              </label>

              {errors.mpesaTransCode && (
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
