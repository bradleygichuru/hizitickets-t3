import axios from "axios";

export class Mpesa {
  shortCode: number;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
  environment: "development" | "production";

  constructor(
    shortCode: number,
    passkey: string,
    consumerKey: string,
    consumerSecret: string,
    environment: "development" | "production"
  ) {
    this.environment = environment;
    this.passkey = passkey;
    this.shortCode = shortCode;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }
  async getAccessToken() {
    let endpoint;

    if (this.environment == "production") {
      endpoint =
        "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    }
    if (this.environment == "development") {
      endpoint =
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    }
    const instanceAuthToken = await axios({
      url: endpoint,
      method: "get",
      auth: {
        username: `${this.consumerKey}`,
        password: `${this.consumerSecret}`,
      },
    }).catch(function (error) {
        throw error;
    });

    return instanceAuthToken?.data?.access_token;
  }
  async simulateStkPush(
    mobileNumber: string,
    amount: number,
    accountReference: string,
    transactionDescription: string,
    transactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline",
    partyB: number,
    callbackUrl: string
  ) {
    const date = new Date();

    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
    const password = Buffer.from(
      `${this.shortCode}${this.passkey}${timestamp}`
    ).toString("base64");
    
    let endpoint;

    if (this.environment == "production") {
      endpoint = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    }
    if (this.environment == "development") {
      endpoint =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    }
    const accessToken = await this.getAccessToken();

    const buyRequest = await axios({
      url: endpoint,
      data: {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: parseInt(`254${mobileNumber}`),
        PartyB: partyB,
        PhoneNumber: parseInt(`254${mobileNumber}`),
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDescription,
      },
      method: "post",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }).catch(function (error) {
        throw error;
    });
    return buyRequest?.data;
  }
}
