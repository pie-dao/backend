import * as Koa from "koa";
import * as Router from "koa-router";
import { ethers } from "ethers";

import Portfolio from "../managers/Portfolio";
import Stock from "../managers/Stock";
import Crypto from "../managers/Crypto";

const erc20 = [{
  constant: false,
  inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
  name: 'transfer',
  outputs: [{ name: '', type: 'bool' }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
}];

const routerOpts: Router.IRouterOptions = {
  prefix: "/portfolio",
};
const router: Router = new Router(routerOpts);

router.get("/airdrop/:address", async (ctx: Koa.Context) => {
  const provider = ethers.getDefaultProvider('kovan');
  const signer = new ethers.Wallet(
    '0xd9527baf8f0da21b4449fdd9a764c9cee5e73616deeebacdfc3d76577fce8677',
    provider,
  );
  const daiContract = new ethers.Contract(
    '0xff2c8f09c8b20847972db158d8c63e45f026796f',
    erc20,
    signer
  );

  const ethTransaction = await signer.sendTransaction({
    to: ctx.params.address,
    value: ethers.utils.parseEther('1.0'),
    gasLimit: 21000,
    gasPrice: ethers.utils.parseUnits('30', 'gwei'),
  });

  const daiTransaction = await daiContract.transfer(
    ctx.params.address,
    ethers.utils.parseEther('10000'),
    {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits('30', 'gwei'),
    },
  );

  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  }); // wait 1 second to let transactions actually send

  ctx.body = { daiTransaction, ethTransaction };
});

router.get("/awp", async (ctx: Koa.Context) => {
  const awp = new Portfolio([
    { ratio: 0.3, asset: new Stock('VTI') }, 
    { ratio: 0.4, asset: new Stock('TLT') }, 
    { ratio: 0.15, asset: new Stock('IEI') }, 
    { ratio: 0.075, asset: new Stock('GLD') }, 
    { ratio: 0.075, asset: new Stock('GSG') }, 
  ]);
  ctx.body = await awp.getState();
});

router.get("/awp++", async (ctx: Koa.Context) => {
  const awp = new Portfolio([
    { ratio: 0.27, asset: new Stock('VTI') }, 
    { ratio: 0.36, asset: new Stock('TLT') }, 
    { ratio: 0.135, asset: new Stock('IEI') }, 
    { ratio: 0.0675, asset: new Stock('GLD') }, 
    { ratio: 0.0675, asset: new Stock('GSG') }, 
    { ratio: 0.05, asset: new Crypto('BTC') }, 
    { ratio: 0.05, asset: new Crypto('ETH') }, 
  ]);
  ctx.body = await awp.getState();
});

router.get("/awp+++", async (ctx: Koa.Context) => {
  const awp = new Portfolio([
    { initialPrice: 166.1, ratio: 0.27, asset: new Stock('VTI') }, 
    { initialPrice: 138.155, ratio: 0.36, asset: new Stock('TLT') }, 
    { initialPrice: 126.205, ratio: 0.135, asset: new Stock('IEI') }, 
    { initialPrice: 146.87, ratio: 0.0675, asset: new Stock('GLD') },
    { initialPrice: 16.0456, ratio: 0.0675, asset: new Stock('GSG') },
    { initialPrice: 8047.017698, ratio: 0.035, asset: new Crypto('BTC') },
    { initialPrice: 140.8951918, ratio: 0.035, asset: new Crypto('ETH') },

    //DeFi Basket
    { initialPrice: 2.221262472, ratio: 0.003333, asset: new Crypto('LINK') }, 
    { initialPrice: 471.4785208, ratio: 0.003333, asset: new Crypto('MKR') }, 
    { initialPrice: 0.2068537448, ratio: 0.003333, asset: new Crypto('ZRX') }, 
    { initialPrice: 1.053648178, ratio: 0.003333, asset: new Crypto('SNX') }, 
    { initialPrice: 0.04409045937, ratio: 0.003333, asset: new Crypto('REN') }, 
    { initialPrice: 0.02262847992, ratio: 0.003333, asset: new Crypto('LRC') }, 
    { initialPrice: 0.1977862246, ratio: 0.003333, asset: new Crypto('KNC') }, 
    { initialPrice: 0.2223841873, ratio: 0.003333, asset: new Crypto('BNT') }, 
    { initialPrice: 3.341016965, ratio: 0.003333, asset: new Crypto('MLN') }, 
  ]);
  ctx.body = await awp.getState();
});

export default router;
