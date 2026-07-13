import { env } from "../config/env";

const BASE_URL = "https://www.nellobytesystems.com";

export type NelloByteResponse = Record<string, unknown>;

/** MTN, Glo, 9mobile, Airtel → NelloByte network codes */
export const NETWORK_CODES: Record<string, string> = {
  MTN: "01",
  Glo: "02",
  "9mobile": "03",
  t2mobile: "03",
  Airtel: "04",
};

export const CABLE_CODES: Record<string, string> = {
  DStv: "dstv",
  DSTV: "dstv",
  GOtv: "gotv",
  GOTV: "gotv",
  StarTimes: "startimes",
  Showmax: "showmax",
};

/** App bill provider names → NelloByte electric company codes */
export const ELECTRIC_CODES: Record<string, string> = {
  EKEDC: "01",
  IKEDC: "02",
  AEDC: "03",
  KEDCO: "04",
  PHCN: "05",
  PHEDC: "05",
  JEDC: "06",
  IBEDC: "07",
  KAEDC: "08",
  EEDC: "09",
  BEDC: "10",
  YEDC: "11",
  APLE: "12",
};

export const BETTING_CODES: Record<string, string> = {
  Bet9ja: "product-nairabet",
  NairaBet: "product-nairabet",
  SportyBet: "prd-sporty-bet",
  "1xBet": "product-1x-bet",
  BetKing: "product-bet-king",
  BetWay: "product-bet-way",
  BangBet: "product-bang-bet",
  BetLand: "product-bet-land",
  NaijaBet: "product-naija-bet",
  MerryBet: "product-merry-bet",
};

function requireCredentials(): { userId: string; apiKey: string } {
  if (!env.nelloByteUserId || !env.nelloByteApiKey) {
    throw new Error(
      "NelloByte credentials missing. Set NELLOBYTE_USER_ID and NELLOBYTE_API_KEY in .env"
    );
  }
  return { userId: env.nelloByteUserId, apiKey: env.nelloByteApiKey };
}

async function nelloGet(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<NelloByteResponse> {
  const { userId, apiKey } = requireCredentials();
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("UserID", userId);
  url.searchParams.set("APIKey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), { method: "GET" });
  const data = (await response.json()) as NelloByteResponse;
  return data;
}

export function isNelloByteConfigured(): boolean {
  return !!(env.nelloByteUserId && env.nelloByteApiKey);
}

export function networkToCode(network: string): string {
  return NETWORK_CODES[network] || network;
}

export function cableToCode(provider: string): string {
  return CABLE_CODES[provider] || provider.toLowerCase();
}

export function electricToCode(provider: string): string {
  return ELECTRIC_CODES[provider] || provider;
}

export function bettingToCode(platform: string): string {
  return BETTING_CODES[platform] || platform;
}

// ── Wallet ────────────────────────────────────────────────────
export const getProviderWalletBalance = () => nelloGet("APIWalletBalanceV1.asp");

// ── Catalog (live from NelloByte) ─────────────────────────────
export const getAirtimeNetworks = () =>
  nelloGet("APIAirtimeNetworkV2.asp", { UserID: env.nelloByteUserId });

export const getDataNetworks = () =>
  nelloGet("APIDatabundleNetworkV2.asp", { UserID: env.nelloByteUserId });

export const getDataPlans = () =>
  nelloGet("APIDatabundlePlansV2.asp", { UserID: env.nelloByteUserId });

export const getCableTypes = () =>
  nelloGet("APICableTVTypeV2.asp", { UserID: env.nelloByteUserId });

export const getCablePackages = () =>
  nelloGet("APICableTVPackagesV2.asp", { UserID: env.nelloByteUserId });

export const getElectricityDiscos = () =>
  nelloGet("APIElectricityTypeV2.asp", { UserID: env.nelloByteUserId });

export const getBettingCompanies = () =>
  nelloGet("APIBettingTypeV2.asp", { UserID: env.nelloByteUserId });

// ── Verify ────────────────────────────────────────────────────
export const verifyCableSmartcard = (cableTV: string, smartCardNo: string) =>
  nelloGet("APIVerifyCableTVV1.asp", { CableTV: cableTV, SmartCardNo: smartCardNo });

export const verifyElectricityMeter = (
  electricCompany: string,
  meterNo: string,
  meterType: string
) =>
  nelloGet("APIVerifyElectricityV1.asp", {
    ElectricCompany: electricCompany,
    MeterNo: meterNo,
    MeterType: meterType,
  });

export const verifyBettingCustomer = (bettingCompany: string, customerId: string) =>
  nelloGet("APIVerifyBettingV1.asp", {
    BettingCompany: bettingCompany,
    CustomerID: customerId,
  });

// ── Purchases ─────────────────────────────────────────────────
export const buyAirtime = (params: {
  mobileNetwork: string;
  amount: number;
  mobileNumber: string;
  requestId: string;
  callBackURL?: string;
  bonusType?: string;
}) =>
  nelloGet("APIAirtimeV1.asp", {
    MobileNetwork: params.mobileNetwork,
    Amount: params.amount,
    MobileNumber: params.mobileNumber,
    RequestID: params.requestId,
    CallBackURL: params.callBackURL || env.nelloByteCallbackUrl,
    BonusType: params.bonusType,
  });

export const buyDataBundle = (params: {
  mobileNetwork: string;
  dataPlan: string;
  mobileNumber: string;
  requestId: string;
  callBackURL?: string;
}) =>
  nelloGet("APIDatabundleV1.asp", {
    MobileNetwork: params.mobileNetwork,
    DataPlan: params.dataPlan,
    MobileNumber: params.mobileNumber,
    RequestID: params.requestId,
    CallBackURL: params.callBackURL || env.nelloByteCallbackUrl,
  });

export const buyCableTv = (params: {
  cableTV: string;
  packageCode: string;
  smartCardNo: string;
  phoneNo: string;
  requestId: string;
  callBackURL?: string;
}) =>
  nelloGet("APICableTVV1.asp", {
    CableTV: params.cableTV,
    Package: params.packageCode,
    SmartCardNo: params.smartCardNo,
    PhoneNo: params.phoneNo,
    RequestID: params.requestId,
    CallBackURL: params.callBackURL || env.nelloByteCallbackUrl,
  });

export const buyElectricity = (params: {
  electricCompany: string;
  meterType: string;
  meterNo: string;
  amount: number;
  phoneNo: string;
  requestId: string;
  callBackURL?: string;
}) =>
  nelloGet("APIElectricityV1.asp", {
    ElectricCompany: params.electricCompany,
    MeterType: params.meterType,
    MeterNo: params.meterNo,
    Amount: params.amount,
    PhoneNo: params.phoneNo,
    RequestID: params.requestId,
    CallBackURL: params.callBackURL || env.nelloByteCallbackUrl,
  });

export const fundBettingWallet = (params: {
  bettingCompany: string;
  customerId: string;
  amount: number;
  requestId: string;
  callBackURL?: string;
}) =>
  nelloGet("APIBettingV1.asp", {
    BettingCompany: params.bettingCompany,
    CustomerID: params.customerId,
    Amount: params.amount,
    RequestID: params.requestId,
    CallBackURL: params.callBackURL || env.nelloByteCallbackUrl,
  });

// ── Query / Cancel ──────────────────────────────────────────────
export const queryByOrderId = (orderId: string) =>
  nelloGet("APIQueryV1.asp", { OrderID: orderId });

export const queryByRequestId = (requestId: string) =>
  nelloGet("APIQueryV1.asp", { RequestID: requestId });

export const cancelOrder = (orderId: string) =>
  nelloGet("APICancelV1.asp", { OrderID: orderId });

export function mapNelloStatus(data: NelloByteResponse): "success" | "pending" | "failed" {
  const status = String(data.status || data.orderstatus || "").toUpperCase();
  const code = String(data.statuscode || "");

  if (
    status.includes("COMPLETED") ||
    status.includes("SUCCESS") ||
    code === "200"
  ) {
    return "success";
  }
  if (
    status.includes("RECEIVED") ||
    status.includes("PROCESSING") ||
    status.includes("QUEUED") ||
    status.includes("ONHOLD") ||
    code === "100"
  ) {
    return "pending";
  }
  if (
    status.includes("INVALID") ||
    status.includes("FAILED") ||
    status.includes("CANCELLED") ||
    status.startsWith("MISSING_")
  ) {
    return "failed";
  }
  return "pending";
}
