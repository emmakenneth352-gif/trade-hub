/**
 * Legacy Flutter api_list.dart paths (no /api/v1 prefix).
 */
import express from "express";
import { signUp, verifyToken, login, verifyLogin, getProfile } from "../controllers/auth";
import { getNotifications } from "../controllers/notifications";
import {
  getSubscriptionTypes,
  initializeSubscriptionPayment,
} from "../controllers/orders";
import { protectRoute } from "../middleware/auth";
import { catchAsync } from "../utils/asyncHandler";

const legacyRouter = express.Router();

legacyRouter.post("/auth/signUp/getOTP", signUp);
legacyRouter.post("/auth/signUp/verifyOTP", verifyToken);
legacyRouter.post("/auth/login/getOTP", login);
legacyRouter.post("/auth/login/verifyOTP", verifyLogin);

legacyRouter.get("/profile", protectRoute, getProfile);

legacyRouter.get("/notifications/GetAll", protectRoute, getNotifications);

legacyRouter.get("/subscriptions/types", getSubscriptionTypes);
legacyRouter.post(
  "/payments/initialize-subscription",
  protectRoute,
  initializeSubscriptionPayment
);

legacyRouter.get(
  "/matches/dashboardSuggestions",
  protectRoute,
  catchAsync(async (_req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        matches: [],
        hint: "Use GET /api/v1/marketplace/products for Trade Hub home feed",
      },
    });
  })
);

legacyRouter.get(
  "/referrals/details",
  protectRoute,
  catchAsync(async (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        referralCode: req.user.referalCode || "TRADEHUB",
        referrals: 0,
        earnings: 0,
      },
    });
  })
);

legacyRouter.get(
  "/notification-preferences",
  protectRoute,
  catchAsync(async (_req, res) => {
    res.status(200).json({
      status: "success",
      data: { pushEnabled: true, emailEnabled: true },
    });
  })
);

legacyRouter.post(
  "/notification-preferences/create",
  protectRoute,
  catchAsync(async (_req, res) => {
    res.status(201).json({ status: "success" });
  })
);

legacyRouter.put(
  "/notification-preferences/update",
  protectRoute,
  catchAsync(async (_req, res) => {
    res.status(200).json({ status: "success" });
  })
);

legacyRouter.post(
  "/notifications/update/fcm-token",
  protectRoute,
  catchAsync(async (_req, res) => {
    res.status(200).json({ status: "success" });
  })
);

export default legacyRouter;
