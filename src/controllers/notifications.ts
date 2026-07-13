import express from "express";
import { catchAsync } from "../utils/asyncHandler";
import { Notification } from "../models/Notification";
import { seedDemoNotifications } from "../utils/seed";

export const getNotifications = catchAsync(
  async (req: express.Request, res: express.Response) => {
    await seedDemoNotifications(req.user._id.toString());

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: "success",
      data: {
        notifications: notifications.map((n) => ({
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt,
        })),
      },
    });
  }
);

export const markNotificationsRead = catchAsync(
  async (req: express.Request, res: express.Response) => {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ status: "success", message: "Notifications marked read" });
  }
);
