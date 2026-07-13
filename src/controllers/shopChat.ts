import express from "express";
import { Types } from "mongoose";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { ShopConversation } from "../models/ShopConversation";
import { ShopMessage } from "../models/ShopMessage";
import { seedDemoConversations } from "../utils/seed";

const formatConversation = (c: InstanceType<typeof ShopConversation>) => ({
  id: c._id.toString(),
  name: c.sellerName,
  avatar: c.sellerAvatar,
  lastMessage: c.lastMessage,
  time: c.updatedAt,
  unread: c.unread,
  isSeller: true,
  sellerSlug: c.sellerSlug,
});

export const getShopConversations = catchAsync(
  async (req: express.Request, res: express.Response) => {
    await seedDemoConversations(req.user._id.toString());
    const conversations = await ShopConversation.find({ buyerId: req.user._id }).sort({
      updatedAt: -1,
    });

    res.status(200).json({
      status: "success",
      data: { conversations: conversations.map(formatConversation) },
    });
  }
);

export const getShopMessages = catchAsync(async (req: express.Request, res: express.Response) => {
  const conversationId = String(req.params.conversationId);
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new AppError("Invalid conversation id", 400);
  }

  const conversation = await ShopConversation.findOne({
    _id: req.params.conversationId,
    buyerId: req.user._id,
  });
  if (!conversation) throw new AppError("Conversation not found", 404);

  conversation.unread = 0;
  await conversation.save();

  const messages = await ShopMessage.find({ conversationId: conversation._id }).sort({
    createdAt: 1,
  });

  res.status(200).json({
    status: "success",
    data: {
      messages: messages.map((m) => ({
        id: m._id.toString(),
        content: m.content,
        isSeller: m.isSeller,
        createdAt: m.createdAt,
      })),
    },
  });
});

export const sendShopMessage = catchAsync(async (req: express.Request, res: express.Response) => {
  const { content, sellerSlug, sellerName, sellerAvatar } = req.body;
  if (!content?.trim()) throw new AppError("Message content is required", 400);

  let conversation = await ShopConversation.findOne({
    buyerId: req.user._id,
    sellerSlug,
  });

  if (!conversation) {
    if (!sellerSlug || !sellerName) {
      throw new AppError("sellerSlug and sellerName required for new chat", 400);
    }
    conversation = await ShopConversation.create({
      buyerId: req.user._id,
      sellerSlug,
      sellerName,
      sellerAvatar: sellerAvatar || "",
      lastMessage: content.trim(),
      unread: 0,
    });
  } else {
    conversation.lastMessage = content.trim();
    await conversation.save();
  }

  const message = await ShopMessage.create({
    conversationId: conversation._id,
    senderId: req.user._id,
    content: content.trim(),
    isSeller: false,
  });

  res.status(201).json({
    status: "success",
    data: {
      conversationId: conversation._id.toString(),
      message: {
        id: message._id.toString(),
        content: message.content,
        isSeller: false,
        createdAt: message.createdAt,
      },
    },
  });
});

export const openChatWithSeller = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { sellerSlug, sellerName, sellerAvatar } = req.body;
    if (!sellerSlug || !sellerName) {
      throw new AppError("sellerSlug and sellerName are required", 400);
    }

    const conversation = await ShopConversation.findOneAndUpdate(
      { buyerId: req.user._id, sellerSlug },
      {
        buyerId: req.user._id,
        sellerSlug,
        sellerName,
        sellerAvatar: sellerAvatar || "",
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      status: "success",
      data: { conversation: formatConversation(conversation) },
    });
  }
);
