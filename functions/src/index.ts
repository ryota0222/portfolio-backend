import * as functions from "firebase-functions";
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import {ctfWebhookCreateBlogEvent, ctfWebhookUpdateBlogEvent} from "./controllers/contentful";
import {sendMessageToSlack} from "./utils/sendToSlack";
import portfolio from "./controllers/portfolio";

// Create Express server
const app: express.Express = express();

app.use(express.json({
  limit: "500mb",
  verify: (req: any, res: any, buf: Buffer) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({
  limit: "500mb",
  extended: true,
}));

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("success");
});
// portfolio
app.get("/portfolio/works", portfolio.getPortfolioWorks);
app.get("/portfolio/shops", portfolio.getPortfolioShops);

// webhook
app.post("/contentful/lgtm", ctfWebhookCreateBlogEvent);
app.put("/contentful/archive", ctfWebhookUpdateBlogEvent);

// ハンドリングしてきたエラー処理
// エラー処理ミドルウェアは、その他の app.use() およびルート呼び出しの後で最後に定義します
// https://expressjs.com/ja/guide/error-handling.html
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  await sendMessageToSlack("SERVER", err);
});

export const api = functions
    .region("asia-northeast1")
    .https.onRequest(app);