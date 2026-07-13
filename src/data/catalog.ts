/** Static catalogs aligned with the Trade Hub Flutter app (VTU + marketplace). */

export const marketplaceCategories = [
  "Fashion",
  "Fabric",
  "Electronics",
  "Phones",
  "Computers",
  "Home",
  "Kitchen",
  "Beauty",
  "Health",
  "Shoes",
  "Bags",
  "Jewelry",
  "Watches",
  "Sports",
  "Toys",
  "Baby",
  "Food",
  "Pets",
  "Garden",
  "Office",
  "Books",
  "Auto",
  "Tools",
  "Agriculture",
  "Handmade",
  "Wholesale",
  "Other",
];

export const vtuServices = [
  { id: "data", title: "Buy Data", subtitle: "MTN, Airtel, Glo, 9mobile" },
  { id: "airtime", title: "Airtime", subtitle: "Top up any network" },
  { id: "bills", title: "Pay Bills", subtitle: "Electricity, water & more" },
  { id: "gotv", title: "GOtv / DStv", subtitle: "Cable TV subscription" },
  { id: "giftcard", title: "Gift cards", subtitle: "Buy & exchange cards" },
  { id: "betting", title: "Betting", subtitle: "Fund betting wallets" },
  { id: "travel", title: "Travel", subtitle: "Flights, buses & hotels" },
];

export const vtuNetworks = ["MTN", "Airtel", "Glo", "9mobile"];

export const vtuDataPlans = [
  { name: "1GB — 7 days", price: 500 },
  { name: "2GB — 30 days", price: 1500 },
  { name: "5GB — 30 days", price: 3000 },
  { name: "10GB — 30 days", price: 5000 },
];

export const vtuBillProviders = ["EKEDC", "IKEDC", "AEDC", "PHCN", "LAWMA"];
export const vtuCableProviders = ["GOtv", "DStv", "StarTimes", "Showmax"];
export const vtuBettingPlatforms = [
  "Bet9ja",
  "SportyBet",
  "1xBet",
  "BetKing",
  "NairaBet",
];
export const vtuGiftCards = [
  "Amazon",
  "iTunes",
  "Google Play",
  "Steam",
  "Netflix",
];
export const vtuTravelTypes = ["Flights", "Buses", "Hotels", "Visa assist"];

export type SeedProduct = {
  slug: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  sold?: string;
  category: string;
  sellerName: string;
  sellerAvatar: string;
  description: string;
  image: string;
  isFlashDeal?: boolean;
};

export const seedProducts: SeedProduct[] = [
  {
    slug: "wireless-earbuds-pro",
    title: "Wireless Earbuds Pro",
    price: 19500,
    oldPrice: 60000,
    discount: 68,
    sold: "2.4k",
    category: "Electronics",
    sellerName: "Tech Wholesale Co.",
    sellerAvatar: "https://i.pravatar.cc/300?img=33",
    description:
      "Noise-cancelling wireless earbuds with 24hr battery. Perfect for bulk resale.",
    image: "https://picsum.photos/seed/tradehub1/400/400",
    isFlashDeal: true,
  },
  {
    slug: "smart-watch-fitness-band",
    title: "Smart Watch Fitness Band",
    price: 28500,
    oldPrice: 89000,
    discount: 69,
    sold: "1.8k",
    category: "Electronics",
    sellerName: "Gadget Hub",
    sellerAvatar: "https://i.pravatar.cc/300?img=15",
    description:
      "Heart-rate monitor, sleep tracking, and waterproof design for active buyers.",
    image: "https://picsum.photos/seed/tradehub2/400/400",
    isFlashDeal: true,
  },
  {
    slug: "kitchen-blender-set",
    title: "Kitchen Blender Set",
    price: 36000,
    oldPrice: 83000,
    discount: 56,
    sold: "920",
    category: "Kitchen",
    sellerName: "Home Essentials",
    sellerAvatar: "https://i.pravatar.cc/300?img=22",
    description:
      "3-speed blender with glass jar. Great margin for home goods sellers.",
    image: "https://picsum.photos/seed/tradehub3/400/400",
  },
  {
    slug: "led-desk-lamp-usb",
    title: "LED Desk Lamp USB",
    price: 15000,
    oldPrice: 33000,
    discount: 55,
    sold: "3.1k",
    category: "Home",
    sellerName: "Bright Office",
    sellerAvatar: "https://i.pravatar.cc/300?img=28",
    description:
      "Adjustable LED lamp with USB charging port. Fast-moving desk accessory.",
    image: "https://picsum.photos/seed/tradehub4/400/400",
    isFlashDeal: true,
  },
  {
    slug: "men-casual-sneakers",
    title: "Men Casual Sneakers",
    price: 32500,
    oldPrice: 72000,
    discount: 55,
    sold: "1.2k",
    category: "Fashion",
    sellerName: "Urban Step",
    sellerAvatar: "https://i.pravatar.cc/300?img=12",
    description:
      "Lightweight sneakers in multiple sizes. Popular with fashion resellers.",
    image: "https://picsum.photos/seed/tradehub5/400/400",
  },
  {
    slug: "portable-phone-charger",
    title: "Portable Phone Charger",
    price: 21500,
    oldPrice: 53000,
    discount: 59,
    sold: "4.5k",
    category: "Electronics",
    sellerName: "Power Deals",
    sellerAvatar: "https://i.pravatar.cc/300?img=41",
    description:
      "10000mAh power bank with dual USB. Top seller in electronics.",
    image: "https://picsum.photos/seed/tradehub6/400/400",
  },
  {
    slug: "cotton-ankara-fabric-roll",
    title: "Cotton Ankara Fabric Roll",
    price: 12500,
    oldPrice: 27000,
    discount: 53,
    sold: "2.1k",
    category: "Fabric",
    sellerName: "Textile World",
    sellerAvatar: "https://i.pravatar.cc/300?img=52",
    description:
      "Premium wax print fabric, 6 yards per roll. Ideal for tailors and resellers.",
    image: "https://picsum.photos/seed/tradehub7/400/400",
  },
  {
    slug: "linen-blend-fabric-bundle",
    title: "Linen Blend Fabric Bundle",
    price: 24000,
    oldPrice: 48000,
    discount: 50,
    sold: "890",
    category: "Fabric",
    sellerName: "Fabric Depot",
    sellerAvatar: "https://i.pravatar.cc/300?img=58",
    description:
      "Soft linen blend in assorted colors. Wholesale packs of 10 rolls.",
    image: "https://picsum.photos/seed/tradehub8/400/400",
  },
];

export const marketplaceMusicLibrary = [
  {
    id: "m1",
    title: "Chill Shop",
    artist: "Trade Hub Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "m2",
    title: "Hype Market",
    artist: "Trade Hub Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "m3",
    title: "Smooth Sell",
    artist: "Trade Hub Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "m4",
    title: "Live Vibes",
    artist: "Trade Hub Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

export const seedSellerProfiles = [
  {
    slug: "seller-glow",
    name: "Glow Beauty Store",
    username: "glowbeauty",
    avatar: "https://i.pravatar.cc/300?img=25",
    bio: "Wholesale beauty & skincare 🌸\nShips worldwide · Bulk orders welcome",
    followers: "12.4k",
    following: "320",
    category: "Beauty",
    isPro: true,
  },
  {
    slug: "seller-tech",
    name: "Tech Wholesale Co.",
    username: "techwholesale",
    avatar: "https://i.pravatar.cc/300?img=33",
    bio: "Gadgets & electronics at wholesale prices",
    followers: "8.2k",
    following: "210",
    category: "Electronics",
    isPro: false,
  },
  {
    slug: "seller-urban",
    name: "Urban Step",
    username: "urbanstep",
    avatar: "https://i.pravatar.cc/300?img=45",
    bio: "Sneakers & streetwear drops",
    followers: "5.6k",
    following: "180",
    category: "Fashion",
    isPro: false,
  },
  {
    slug: "seller-home",
    name: "Home Essentials",
    username: "homeessentials",
    avatar: "https://i.pravatar.cc/300?img=22",
    bio: "Kitchen & home goods wholesale",
    followers: "3.1k",
    following: "95",
    category: "Home",
    isPro: false,
  },
];

export const seedReels = [
  {
    slug: "reel-1",
    sellerId: "seller-glow",
    sellerName: "Glow Beauty Store",
    sellerAvatar: "https://i.pravatar.cc/300?img=25",
    title: "Morning skincare routine picks",
    caption: "Best sellers for glowing skin ✨ #beauty #skincare",
    views: "12k",
    likes: 1840,
    commentsCount: 126,
    duration: "0:34",
    thumbnail: "https://picsum.photos/seed/video1/400/700",
    productId: "wireless-earbuds-pro",
    musicId: "m1",
  },
  {
    slug: "reel-2",
    sellerId: "seller-tech",
    sellerName: "Tech Wholesale Co.",
    sellerAvatar: "https://i.pravatar.cc/300?img=33",
    title: "Unboxing wireless earbuds pro",
    caption: "Bulk price drop this week 🎧 #tech #wholesale",
    views: "8.4k",
    likes: 920,
    commentsCount: 88,
    duration: "0:28",
    thumbnail: "https://picsum.photos/seed/video2/400/700",
    productId: "wireless-earbuds-pro",
    musicId: "m2",
  },
  {
    slug: "reel-3",
    sellerId: "seller-urban",
    sellerName: "Urban Step",
    sellerAvatar: "https://i.pravatar.cc/300?img=45",
    title: "New sneaker collection 2026",
    caption: "Streetwear drops every Friday 👟 #fashion #sneakers",
    views: "5.1k",
    likes: 654,
    commentsCount: 42,
    duration: "0:41",
    thumbnail: "https://picsum.photos/seed/video3/400/700",
    productId: "men-casual-sneakers",
    musicId: "m3",
  },
];

export const seedLiveSessions = [
  {
    slug: "live-1",
    sellerId: "seller-glow",
    sellerName: "Glow Beauty Store",
    title: "Skincare flash sale live",
    viewers: 342,
    avatar: "https://i.pravatar.cc/300?img=25",
    thumbnail: "https://picsum.photos/seed/live1/600/800",
    musicId: "m1",
    isLive: true,
  },
  {
    slug: "live-2",
    sellerId: "seller-tech",
    sellerName: "Tech Wholesale Co.",
    title: "Earbuds & gadgets deals",
    viewers: 189,
    avatar: "https://i.pravatar.cc/300?img=33",
    thumbnail: "https://picsum.photos/seed/live2/600/800",
    musicId: "m2",
    isLive: true,
  },
];

export const seedTradingListings = [
  {
    slug: "trade-1",
    title: "iPhone 12 128GB",
    type: "SWAP",
    offer: "Swap for Samsung S21 + ₦75,000",
    location: "Lagos, NG",
    sellerName: "Mobile Traders",
    description: "Phone in good condition, minor scratches on back.",
    image: "https://picsum.photos/seed/trade1/400/400",
  },
  {
    slug: "trade-2",
    title: "Designer Handbag",
    type: "TRADE",
    offer: "Trade for sneakers size 42",
    location: "Nairobi, KE",
    sellerName: "Style Exchange",
    description: "Authentic handbag, used twice.",
    image: "https://picsum.photos/seed/trade2/400/400",
  },
];

export const sellerProPlans = [
  { id: "monthly", name: "Seller Pro Monthly", price: 15000, durationDays: 30 },
  { id: "yearly", name: "Seller Pro Yearly", price: 120000, durationDays: 365 },
];

export const datingPremiumPlans = [
  { id: "premium_monthly", name: "Premium Monthly", price: 4999 },
  { id: "premium_yearly", name: "Premium Yearly", price: 39999 },
];

