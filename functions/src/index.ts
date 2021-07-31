import * as functions from "firebase-functions";
import express, {Request, Response} from "express";
import cors from "cors";
import {ctfWebhookCreateBlogEvent, ctfWebhookUpdateBlogEvent} from "./controllers/contentful";
import {sendMessageToSlack} from "./utils/sendToSlack";
import portfolio from "./controllers/portfolio";
import blog from "./controllers/blog";
import roadmap from "./controllers/roadmap";
import r from "./utils/response";
import {postNotificationFromSentryToSlack} from "./controllers/sentry";

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
  r.success(res, "success");
});
// portfolio
app.get("/portfolio/works", portfolio.getPortfolioWorks);
app.get("/portfolio/shops", portfolio.getPortfolioShops);
// blog
app.get("/blog", blog.getBlog);
app.get("/blog/contents", blog.getBlogContents);
app.get("/blog/contents/lgtm", blog.getBlogContentsLgtm);
app.post("/blog/contents/lgtm", blog.postBlogContentsLgtm);
app.get("/blog/contents/:id", blog.getBlogContent);
// roadmap
app.get("/roadmap", roadmap.getRoadmap);

// webhook
app.post("/contentful/lgtm", ctfWebhookCreateBlogEvent);
app.put("/contentful/archive", ctfWebhookUpdateBlogEvent);
app.post("/sentry", postNotificationFromSentryToSlack);

// ハンドリングしてきたエラー処理
// エラー処理ミドルウェアは、その他の app.use() およびルート呼び出しの後で最後に定義します
// https://expressjs.com/ja/guide/error-handling.html
app.use(async (err: Error) => {
  await sendMessageToSlack("SERVER", err);
});

// 予算アラート通知
export const notifyUsageFeeToSlack = functions.pubsub.topic("notifyUsageFeeToSlack").onPublish((message) => {
  const messageBody_JSON = Buffer.from(message.data, "base64").toString();
  const messageBody = JSON.parse(messageBody_JSON);
  console.log(messageBody_JSON);
  const cost = messageBody.costAmount;
  const budget = messageBody.budgetAmount;
  if (cost > Number(budget) - 10) {
    const message_text = `今月の利用額：${cost}円\n予算：${budget}円`;
    sendMessageToSlack("SERVER", {
      name: "Firebase 予算アラート",
      message: message_text,
      type: "info",
    });
  }
});

export const api = functions
    .region("asia-northeast1")
    .https.onRequest(app);
