import * as Koa from "koa";
import * as Router from "koa-router";

import config from '../config';
import { callbackGenerator, UniswapModel } from "../models/Uniswap";

const routerOpts: Router.IRouterOptions = {
    prefix: "/uniswap",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
  ctx.body = config.UNISWAP_TOKENS.split(',');
});

router.get("/:address", async (ctx: Koa.Context) => {
  const { address } = ctx.params;

  const data = await new Promise((resolve, reject) => {
    UniswapModel.find({ address }).exec(callbackGenerator(resolve, reject));
  })

  ctx.body = { address, data };
});

export default router;
