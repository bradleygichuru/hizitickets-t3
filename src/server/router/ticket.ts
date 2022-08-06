import { z } from "zod";
import { createRouter } from "./context";
import axios from "axios";
const businessShortCode = 174379;
const passkey =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
export const ticketRouter = createRouter().mutation("buyTicket", {
  input: z.object({ mobileNumber: z.number() }),
  async resolve({ input }) {
    let date = new Date();
    var status: string;
    let timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
    let password = Buffer.from(
      `${businessShortCode}${passkey}${timestamp}`
    ).toString("base64");
    const instance = axios({
      url: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      method: "get",
      auth: {
        username: "Azs2KejU1ARvIL5JdJsARbV2gDrWmpOB",
        password: "hipGvFJbOxri330c",
      },
    })
      .then((res) => {
        console.log(res.data);
        axios({
          url: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          data: {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerBuyGoodsOnline",
            Amount: 1,
            PartyA:parseInt(`254${input.mobileNumber}`),
            PartyB: businessShortCode,
            PhoneNumber:parseInt(`254${input.mobileNumber}`),
            CallBackURL: "https://9716-102-217-126-3.eu.ngrok.io/",
            AccountReference: "2ddadaw",
            TransactionDesc: "test",
          },
          method: "post",
          headers: {
            Authorization: `Bearer ${res.data.access_token}`,
          },
        })
          .then((res) => {
            console.log(res.data);
            if (res.data.ResponseCode == "0") {
              status = "success";
            } else {
              status = "error";
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
   
  },
});
