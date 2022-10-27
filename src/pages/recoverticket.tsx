import type { NextPage } from "next";
import Layout from "../components/layout";
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
  const findTicketsMutation = trpc.useMutation("ticket.findMerchantId");
  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    findTicketsMutation
      .mutateAsync({
        phoneNumber: data.phoneNumber,
        eventName: data.eventName,
        ticketType: data.ticketType,
      })
      .then((transactions) => {
        console.log(transactions);
      });
  };
  return (
    <Layout>
      <div className="bg-primary my-2 h-screen mx-2 rounded p-10">
        <h1 className="font-medium grid text-accent leading-tight text-3xl ml-4 mb-2">
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
              <label className="m-2 input-group input-group-md input-group-vertical">
                <span>number</span>
                <input
                  type="text"
                  placeholder="+2547 xxx xxxxx"
                  className="input input-bordered"
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
              <label className="m-2 input-group input-group-md input-group-vertical">
                <span>name</span>
                <input
                  type="text"
                  placeholder="Group ticket"
                  className="input input-bordered"
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
              <label className="m-2 input-group input-group-md input-group-vertical">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="eg. OktoberFest "
                  className="input input-bordered"
                  {...register("eventName", { required: true })}
                />
              </label>

              {errors.eventName && (
                <label className="label">
                  <span className="text-red-900">This field is required</span>
                </label>
              )}
              <button type="submit" className="btn bg-accent m-2">
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
