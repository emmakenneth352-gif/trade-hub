import express from "express";
import { protectRoute } from "../middleware/auth";
import {
  getVtuCatalog,
  getWallet,
  fundWallet,
  getVtuHistory,
  purchaseVtu,
  getProviderWallet,
  getLiveDataPlans,
  getLiveCablePackages,
  verifyCable,
  verifyElectricity,
  verifyBetting,
  queryVtuTransaction,
  nelloByteCallback,
  cancelVtuOrder,
} from "../controllers/vtu";
import {
  getCategories,
  getProducts,
  getFlashDeals,
  getProductById,
  createProduct,
} from "../controllers/marketplace";
import {
  getReels,
  getReelById,
  getReelComments,
  addReelComment,
  likeReel,
} from "../controllers/reels";
import {
  getLiveSessions,
  getLiveSession,
  getLiveComments,
  addLiveComment,
  startLiveSession,
  endLiveSession,
  getLiveAccess,
} from "../controllers/live";
import {
  getSellerProfile,
  getSellerVideos,
  updateMyShopProfile,
  getMyUserPosts,
  createUserPost,
} from "../controllers/sellers";
import {
  getTradingListings,
  createTradingListing,
  getFavorites,
  addFavorite,
  removeFavorite,
  followSeller,
  unfollowSeller,
  getFollowing,
  isFollowing,
} from "../controllers/social";
import {
  getShopConversations,
  getShopMessages,
  sendShopMessage,
  openChatWithSeller,
} from "../controllers/shopChat";
import { getNotifications, markNotificationsRead } from "../controllers/notifications";
import {
  createOrder,
  getOrders,
  getSubscriptionTypes,
  subscribeSellerPro,
  getSellerProStatus,
  initializeSubscriptionPayment,
} from "../controllers/orders";
import { getMusicLibrary } from "../controllers/music";

const apiRouter = express.Router();

apiRouter.get("/vtu/catalog", getVtuCatalog);
apiRouter.get("/vtu/provider-wallet", protectRoute, getProviderWallet);
apiRouter.get("/vtu/data-plans", getLiveDataPlans);
apiRouter.get("/vtu/cable-packages", getLiveCablePackages);
apiRouter.post("/vtu/verify/cable", protectRoute, verifyCable);
apiRouter.post("/vtu/verify/electricity", protectRoute, verifyElectricity);
apiRouter.post("/vtu/verify/betting", protectRoute, verifyBetting);
apiRouter.get("/vtu/query", protectRoute, queryVtuTransaction);
apiRouter.post("/vtu/callback", nelloByteCallback);
apiRouter.get("/vtu/callback", nelloByteCallback);
apiRouter.post("/vtu/cancel/:orderId", protectRoute, cancelVtuOrder);
apiRouter.get("/wallet", protectRoute, getWallet);
apiRouter.post("/wallet/fund", protectRoute, fundWallet);
apiRouter.get("/vtu/history", protectRoute, getVtuHistory);
apiRouter.post("/vtu/purchase", protectRoute, purchaseVtu);

apiRouter.get("/marketplace/categories", getCategories);
apiRouter.get("/marketplace/products", getProducts);
apiRouter.get("/marketplace/flash-deals", getFlashDeals);
apiRouter.get("/marketplace/products/:id", getProductById);
apiRouter.post("/marketplace/products", protectRoute, createProduct);

apiRouter.get("/reels", getReels);
apiRouter.get("/reels/:id", getReelById);
apiRouter.get("/reels/:id/comments", getReelComments);
apiRouter.post("/reels/:id/comments", protectRoute, addReelComment);
apiRouter.post("/reels/:id/like", protectRoute, likeReel);

apiRouter.get("/live", getLiveSessions);
apiRouter.get("/live/access", protectRoute, getLiveAccess);
apiRouter.post("/live/start", protectRoute, startLiveSession);
apiRouter.get("/live/:id", getLiveSession);
apiRouter.get("/live/:id/comments", getLiveComments);
apiRouter.post("/live/:id/comments", protectRoute, addLiveComment);
apiRouter.post("/live/:id/end", protectRoute, endLiveSession);

apiRouter.get("/sellers/:id", getSellerProfile);
apiRouter.get("/sellers/:id/videos", getSellerVideos);
apiRouter.patch("/shop/profile", protectRoute, updateMyShopProfile);
apiRouter.get("/posts/mine", protectRoute, getMyUserPosts);
apiRouter.post("/posts", protectRoute, createUserPost);

apiRouter.get("/trading", getTradingListings);
apiRouter.post("/trading", protectRoute, createTradingListing);

apiRouter.get("/favorites", protectRoute, getFavorites);
apiRouter.post("/favorites/:productId", protectRoute, addFavorite);
apiRouter.delete("/favorites/:productId", protectRoute, removeFavorite);
apiRouter.get("/following", protectRoute, getFollowing);
apiRouter.post("/follow", protectRoute, followSeller);
apiRouter.delete("/follow/:sellerSlug", protectRoute, unfollowSeller);
apiRouter.get("/follow/:sellerSlug", protectRoute, isFollowing);

apiRouter.get("/shop/conversations", protectRoute, getShopConversations);
apiRouter.get("/shop/conversations/:conversationId/messages", protectRoute, getShopMessages);
apiRouter.post("/shop/messages", protectRoute, sendShopMessage);
apiRouter.post("/shop/chat/open", protectRoute, openChatWithSeller);

apiRouter.get("/notifications", protectRoute, getNotifications);
apiRouter.patch("/notifications/read", protectRoute, markNotificationsRead);

apiRouter.post("/orders", protectRoute, createOrder);
apiRouter.get("/orders", protectRoute, getOrders);

apiRouter.get("/subscriptions/types", getSubscriptionTypes);
apiRouter.get("/seller-pro/status", protectRoute, getSellerProStatus);
apiRouter.post("/seller-pro/subscribe", protectRoute, subscribeSellerPro);
apiRouter.post("/payments/initialize-subscription", protectRoute, initializeSubscriptionPayment);

apiRouter.get("/music", getMusicLibrary);

export default apiRouter;
