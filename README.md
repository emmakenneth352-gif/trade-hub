# Trade Hub Backend

Marketplace + VTU API for the Trade Hub Flutter app.

## Quick start (no `.env` required for Mongo/JWT in dev)

```powershell
cd D:\tmp\trade-hub-backend
npm install
npm run dev
```

Health check: `GET http://localhost:3000/health`

## NelloByte VTU setup

1. Copy `.env.example` to `.env`
2. Set `NELLOBYTE_USER_ID` and `NELLOBYTE_API_KEY` from [NelloByte Systems](https://www.nellobytesystems.com)
3. Set `NELLOBYTE_CALLBACK_URL` to your public URL + `/api/v1/vtu/callback`

Without credentials, VTU purchases return demo `ORDER_RECEIVED` responses.

## VTU API routes (`/api/v1`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/vtu/catalog` | — | Static + live NelloByte catalog |
| GET | `/vtu/data-plans` | — | Live data plans from NelloByte |
| GET | `/vtu/cable-packages` | — | Live cable packages |
| GET | `/vtu/provider-wallet` | ✓ | NelloByte reseller wallet balance |
| POST | `/vtu/verify/cable` | ✓ | Verify smartcard/IUC |
| POST | `/vtu/verify/electricity` | ✓ | Verify meter number |
| POST | `/vtu/verify/betting` | ✓ | Verify betting customer ID |
| GET | `/vtu/query` | ✓ | Query by `orderId` or `requestId` |
| POST/GET | `/vtu/callback` | — | NelloByte async status webhook |
| POST | `/vtu/cancel/:orderId` | ✓ | Cancel pending order |
| GET | `/wallet` | ✓ | User in-app wallet |
| POST | `/wallet/fund` | ✓ | Fund user wallet (dev) |
| GET | `/vtu/history` | ✓ | Transaction history |
| POST | `/vtu/purchase` | ✓ | Buy airtime/data/cable/bills/betting |

Supported `serviceId` values for purchase: `airtime`, `data`, `gotv`, `bills`, `betting`.

## Deploy (Railway, Render, etc.)

1. Connect this repo: [trade-hub](https://github.com/emmakenneth352-gif/trade-hub)
2. **Build command:** `npm run build`
3. **Start command:** `npm start`
4. Set environment variables in your host dashboard (do not commit `.env`):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE` | Yes (prod) | MongoDB connection string |
| `JWT_SECRET` | Yes (prod) | Min 32 characters |
| `NELLOBYTE_USER_ID` | For live VTU | NelloByte reseller ID |
| `NELLOBYTE_API_KEY` | For live VTU | NelloByte API key |
| `NELLOBYTE_CALLBACK_URL` | Recommended | `https://your-api.com/api/v1/vtu/callback` |
| `CLOUDINARY_URL` | Optional | `cloudinary://key:secret@cloud_name` |
| `PORT` | Optional | Host usually sets this |

Health check after deploy: `GET /health`

