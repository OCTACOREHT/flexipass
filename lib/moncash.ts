type MoncashMode = "sandbox" | "live";

type MoncashTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
};

type MoncashCreatePaymentResponse = {
  path?: string;
  payment_token?: {
    expired?: string;
    created?: string;
    token?: string;
  };
  timestamp?: number;
  status?: number;
  mode?: MoncashMode;
  error?: string;
  message?: string;
};

type MoncashRetrievePaymentResponse = {
  path?: string;
  payment?: {
    reference?: string;
    transaction_id?: string;
    cost?: number;
    message?: string;
    payer?: string;
  };
  timestamp?: number;
  status?: number;
  error?: string;
  message?: string;
};

const getMode = (): MoncashMode => {
  const mode = (process.env.MONCASH_MODE || "sandbox").toLowerCase();
  return mode === "live" ? "live" : "sandbox";
};

const getRestApiBase = () => {
  const mode = getMode();
  return mode === "live"
    ? "https://moncashbutton.digicelgroup.com/Api"
    : "https://sandbox.moncashbutton.digicelgroup.com/Api";
};

const getGatewayBase = () => {
  const mode = getMode();
  return mode === "live"
    ? "https://moncashbutton.digicelgroup.com/Moncash-middleware"
    : "https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware";
};

const getBasicAuthHeader = () => {
  const clientId = process.env.MONCASH_CLIENT_ID || "";
  const clientSecret = process.env.MONCASH_CLIENT_SECRET || "";
  if (!clientId || !clientSecret) return "";
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
};

export const getRedirectUrl = (paymentToken: string) =>
  `${getGatewayBase()}/Payment/Redirect?token=${paymentToken}`;

export async function getAccessToken(): Promise<MoncashTokenResponse> {
  const authHeader = getBasicAuthHeader();
  if (!authHeader) throw new Error("Identifiants MonCash manquants");

  const response = await fetch(`${getRestApiBase()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      scope: "read,write",
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MonCash auth failed (${response.status}): ${text}`);
  }

  return (await response.json()) as MoncashTokenResponse;
}

export async function createPayment(amount: number, orderId: string): Promise<MoncashCreatePaymentResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getRestApiBase()}/v1/CreatePayment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, orderId }),
  });

  const json = (await response.json()) as MoncashCreatePaymentResponse;
  return json;
}

export async function retrieveTransactionPayment(transactionId: string): Promise<MoncashRetrievePaymentResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getRestApiBase()}/v1/RetrieveTransactionPayment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transactionId }),
  });

  return (await response.json()) as MoncashRetrievePaymentResponse;
}

export async function retrieveOrderPayment(orderId: string): Promise<MoncashRetrievePaymentResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getRestApiBase()}/v1/RetrieveOrderPayment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  return (await response.json()) as MoncashRetrievePaymentResponse;
}
