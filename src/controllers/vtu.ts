import express from "express";
import { Types } from "mongoose";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Wallet } from "../models/Wallet";
import { IVtuTransaction, VtuTransaction } from "../models/VtuTransaction";
import {
  vtuBettingPlatforms,
  vtuBillProviders,
  vtuCableProviders,
  vtuDataPlans,
  vtuNetworks,
  vtuServices,
} from "../data/catalog";
import {
  bettingToCode,
  buyAirtime,
  buyCableTv,
  buyDataBundle,
  buyElectricity,
  cableToCode,
  cancelOrder,
  electricToCode,
  fundBettingWallet,
  getBettingCompanies,
  getCablePackages,
  getCableTypes,
  getAirtimeNetworks,
  getDataPlans,
  getElectricityDiscos,
  getProviderWalletBalance,
  isNelloByteConfigured,
  mapNelloStatus,
  networkToCode,
  queryByOrderId,
  queryByRequestId,
  verifyBettingCustomer,
  verifyCableSmartcard,
  verifyElectricityMeter,
} from "../services/nelloByte";

const SERVICE_TITLES: Record<string, string> = Object.fromEntries(
  vtuServices.map((s) => [s.id, s.title])
);

const makeRequestId = (userId: string) =>
  `TH-${userId.slice(-6)}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const makeReference = () =>
  `VTU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

async function fetchLiveCatalog() {
  if (!isNelloByteConfigured()) return null;
  try {
    const [airtimeNetworks, dataPlans, cableTypes, cablePackages, discos, betting] =
      await Promise.all([
        getAirtimeNetworks().catch(() => null),
        getDataPlans().catch(() => null),
        getCableTypes().catch(() => null),
        getCablePackages().catch(() => null),
        getElectricityDiscos().catch(() => null),
        getBettingCompanies().catch(() => null),
      ]);
    return { airtimeNetworks, dataPlans, cableTypes, cablePackages, discos, betting };
  } catch {
    return null;
  }
}

export const getVtuCatalog = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    const live = await fetchLiveCatalog();
    res.status(200).json({
      status: "success",
      data: {
        provider: "nellobytesystems",
        configured: isNelloByteConfigured(),
        services: vtuServices,
        networks: vtuNetworks,
        dataPlans: vtuDataPlans,
        billProviders: vtuBillProviders,
        cableProviders: vtuCableProviders,
        bettingPlatforms: vtuBettingPlatforms,
        live,
      },
    });
  }
);

export const getProviderWallet = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    if (!isNelloByteConfigured()) {
      throw new AppError("NelloByte VTU provider is not configured", 503);
    }
    const balance = await getProviderWalletBalance();
    res.status(200).json({ status: "success", data: balance });
  }
);

export const getLiveDataPlans = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    if (!isNelloByteConfigured()) {
      throw new AppError("NelloByte VTU provider is not configured", 503);
    }
    const plans = await getDataPlans();
    res.status(200).json({ status: "success", data: plans });
  }
);

export const getLiveCablePackages = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    if (!isNelloByteConfigured()) {
      throw new AppError("NelloByte VTU provider is not configured", 503);
    }
    const packages = await getCablePackages();
    res.status(200).json({ status: "success", data: packages });
  }
);

export const verifyCable = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { cableTV, smartCardNo } = req.body;
    if (!cableTV || !smartCardNo) {
      throw new AppError("cableTV and smartCardNo are required", 400);
    }
    const result = await verifyCableSmartcard(
      cableToCode(cableTV),
      smartCardNo
    );
    res.status(200).json({ status: "success", data: result });
  }
);

export const verifyElectricity = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { provider, meterNo, meterType = "01" } = req.body;
    if (!provider || !meterNo) {
      throw new AppError("provider and meterNo are required", 400);
    }
    const result = await verifyElectricityMeter(
      electricToCode(provider),
      meterNo,
      meterType
    );
    res.status(200).json({ status: "success", data: result });
  }
);

export const verifyBetting = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { platform, customerId } = req.body;
    if (!platform || !customerId) {
      throw new AppError("platform and customerId are required", 400);
    }
    const result = await verifyBettingCustomer(
      bettingToCode(platform),
      customerId
    );
    res.status(200).json({ status: "success", data: result });
  }
);

export const queryVtuTransaction = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { orderId, requestId } = req.query;
    if (!orderId && !requestId) {
      throw new AppError("orderId or requestId is required", 400);
    }

    const result = orderId
      ? await queryByOrderId(String(orderId))
      : await queryByRequestId(String(requestId));

    if (requestId) {
      await VtuTransaction.findOneAndUpdate(
        { requestId: String(requestId), userId: req.user._id },
        {
          providerStatus: String(result.status || result.orderstatus || ""),
          providerRemark: String(result.remark || result.orderremark || ""),
          status: mapNelloStatus(result),
          providerResponse: result,
          orderId: String(result.orderid || ""),
        }
      );
    }

    res.status(200).json({ status: "success", data: result });
  }
);

export const nelloByteCallback = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const payload = { ...req.query, ...req.body } as Record<string, unknown>;
    const requestId = String(payload.requestid || "");
    const orderId = String(payload.orderid || "");

    const tx = await VtuTransaction.findOne({
      $or: [
        ...(requestId ? [{ requestId }] : []),
        ...(orderId ? [{ orderId }] : []),
      ],
    });

    if (tx) {
      tx.providerStatus = String(payload.orderstatus || payload.status || "");
      tx.providerRemark = String(payload.orderremark || "");
      tx.status = mapNelloStatus(payload);
      tx.orderId = orderId || tx.orderId;
      tx.providerResponse = payload;
      await tx.save();
    }

    res.status(200).json({ status: "success" });
  }
);

export const getWallet = catchAsync(async (req: express.Request, res: express.Response) => {
  const wallet = await Wallet.getOrCreate(new Types.ObjectId(req.user._id.toString()));
  res.status(200).json({
    status: "success",
    data: { wallet: { balance: wallet.balance, currency: wallet.currency } },
  });
});

export const fundWallet = catchAsync(async (req: express.Request, res: express.Response) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount < 100) {
    throw new AppError("Minimum fund amount is ₦100", 400);
  }

  const wallet = await Wallet.getOrCreate(new Types.ObjectId(req.user._id.toString()));
  wallet.balance += amount;
  await wallet.save();

  res.status(200).json({
    status: "success",
    message: "Wallet funded successfully",
    data: {
      wallet: { balance: wallet.balance, currency: wallet.currency },
      fundedAmount: amount,
    },
  });
});

export const getVtuHistory = catchAsync(async (req: express.Request, res: express.Response) => {
  const filter = (req.query.serviceId as string) || "all";
  const query: Record<string, unknown> = { userId: req.user._id };
  if (filter !== "all") query.serviceId = filter;

  const transactions = await VtuTransaction.find(query).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: transactions.length,
    data: { transactions },
  });
});

async function executeNelloPurchase(
  serviceId: string,
  body: Record<string, unknown>,
  requestId: string
): Promise<Record<string, unknown>> {
  if (!isNelloByteConfigured()) {
    return {
      orderid: `demo-${Date.now()}`,
      statuscode: "100",
      status: "ORDER_RECEIVED",
    };
  }

  switch (serviceId) {
    case "airtime":
      return buyAirtime({
        mobileNetwork: networkToCode(String(body.network)),
        amount: Number(body.amount),
        mobileNumber: String(body.phone || body.account),
        requestId,
      });
    case "data":
      return buyDataBundle({
        mobileNetwork: networkToCode(String(body.network)),
        dataPlan: String(body.dataPlan || body.planId),
        mobileNumber: String(body.phone || body.account),
        requestId,
      });
    case "gotv":
      return buyCableTv({
        cableTV: cableToCode(String(body.provider)),
        packageCode: String(body.packageCode || body.planName),
        smartCardNo: String(body.account),
        phoneNo: String(body.phone || body.account),
        requestId,
      });
    case "bills":
      return buyElectricity({
        electricCompany: electricToCode(String(body.provider)),
        meterType: String(body.meterType || "01"),
        meterNo: String(body.account),
        amount: Number(body.amount),
        phoneNo: String(body.phone || body.account),
        requestId,
      });
    case "betting":
      return fundBettingWallet({
        bettingCompany: bettingToCode(String(body.provider)),
        customerId: String(body.account || body.phone),
        amount: Number(body.amount),
        requestId,
      });
    default:
      throw new AppError(`Service ${serviceId} is not supported via NelloByte yet`, 400);
  }
}

export const purchaseVtu = catchAsync(async (req: express.Request, res: express.Response) => {
  const {
    serviceId,
    amount,
    network,
    provider,
    planName,
    planId,
    packageCode,
    account,
    phone,
    meterType,
    dataPlan,
  } = req.body;

  if (!serviceId || !SERVICE_TITLES[serviceId]) {
    throw new AppError("Invalid VTU service", 400);
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 50) {
    throw new AppError("Amount must be at least ₦50", 400);
  }

  const contact = String(account || phone || "").trim();
  if (!contact) throw new AppError("Phone number or account is required", 400);

  const wallet = await Wallet.getOrCreate(new Types.ObjectId(req.user._id.toString()));
  if (wallet.balance < parsedAmount) {
    throw new AppError("Insufficient wallet balance. Fund your wallet first.", 402);
  }

  const requestId = makeRequestId(req.user._id.toString());
  const reference = makeReference();

  const nelloResult = await executeNelloPurchase(
    serviceId,
    {
      network,
      provider,
      amount: parsedAmount,
      phone,
      account: contact,
      planName,
      planId: planId || dataPlan || planName,
      packageCode: packageCode || planName,
      meterType,
    },
    requestId
  );

  const providerStatus = String(nelloResult.status || "");
  if (providerStatus === "INVALID_CREDENTIALS") {
    throw new AppError("VTU provider credentials are invalid", 502);
  }
  if (providerStatus.startsWith("MISSING_") || providerStatus.startsWith("INVALID_")) {
    throw new AppError(providerStatus.replace(/_/g, " "), 400);
  }

  const txStatus = mapNelloStatus(nelloResult);
  if (txStatus === "failed") {
    throw new AppError(String(nelloResult.status || "VTU purchase failed"), 400);
  }

  wallet.balance -= parsedAmount;
  await wallet.save();

  const subtitleParts = [provider || network, planName || planId, contact].filter(Boolean);
  const transaction: IVtuTransaction = await VtuTransaction.create({
    userId: req.user._id,
    serviceId,
    title: SERVICE_TITLES[serviceId],
    subtitle: subtitleParts.join(" · "),
    amount: parsedAmount,
    status: txStatus,
    network: network || undefined,
    provider: provider || undefined,
    planName: planName || undefined,
    account: contact,
    reference,
    requestId,
    orderId: nelloResult.orderid ? String(nelloResult.orderid) : undefined,
    providerStatus,
    providerRemark: String(nelloResult.remark || ""),
    providerResponse: nelloResult,
    meterToken: nelloResult.metertoken ? String(nelloResult.metertoken) : undefined,
  });

  res.status(201).json({
    status: "success",
    message: `${SERVICE_TITLES[serviceId]} — ${providerStatus || "processing"}`,
    data: {
      transaction,
      provider: nelloResult,
      wallet: { balance: wallet.balance, currency: wallet.currency },
    },
  });
});

export const cancelVtuOrder = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const orderId = String(req.params.orderId);
    const tx = await VtuTransaction.findOne({ orderId, userId: req.user._id });
    if (!tx) throw new AppError("Transaction not found", 404);

    const result = await cancelOrder(orderId);
    tx.status = "failed";
    tx.providerStatus = String(result.status || "ORDER_CANCELLED");
    tx.providerResponse = result;
    await tx.save();

    res.status(200).json({ status: "success", data: result });
  }
);
