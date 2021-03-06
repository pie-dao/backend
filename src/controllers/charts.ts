import * as Koa from "koa";
import * as Router from "koa-router";
import * as moment from 'moment';
import axios from 'axios';
import Charts from "../managers/Charts";
import Portfolio from "../managers/Portfolio";
import Stock from "../managers/Stock";
import Crypto from "../managers/Crypto";
import {ComparisonModel} from "../models/Comparison";


const routerOpts: Router.IRouterOptions = {
  prefix: "/charts",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
  const chart = new Charts();
  ctx.body = await chart.main();
});

router.get("/generate/:date", async (ctx: Koa.Context) => {
  const chart = new Charts();
  const compound = await chart.getCompoundData();

  const awp = new Portfolio([
    { ratio: 0.3, asset: new Stock('VTI') }, 
    { ratio: 0.4, asset: new Stock('TLT') }, 
    { ratio: 0.15, asset: new Stock('IEI') }, 
    { ratio: 0.075, asset: new Stock('GLD') }, 
    { ratio: 0.075, asset: new Stock('GSG') }, 
  ]);

  const awpPlusPlus = new Portfolio([
    { ratio: 0.27, asset: new Stock('VTI') }, 
    { ratio: 0.36, asset: new Stock('TLT') }, 
    { ratio: 0.135, asset: new Stock('IEI') }, 
    { ratio: 0.0675, asset: new Stock('GLD') }, 
    { ratio: 0.0675, asset: new Stock('GSG') }, 
    { ratio: 0.035, asset: new Crypto('BTC') }, 
    { ratio: 0.035, asset: new Crypto('ETH') },

    { ratio: 0.003333, asset: new Crypto('LINK') }, 
    { ratio: 0.003333, asset: new Crypto('MKR') }, 
    { ratio: 0.003333, asset: new Crypto('ZRX') }, 
    { ratio: 0.003333, asset: new Crypto('SNX') }, 
    { ratio: 0.003333, asset: new Crypto('REN') }, 
    { ratio: 0.003333, asset: new Crypto('LRC') }, 
    { ratio: 0.003333, asset: new Crypto('KNC') }, 
    { ratio: 0.003333, asset: new Crypto('BNT') }, 
    { ratio: 0.003333, asset: new Crypto('MLN') }, 
  ]);

  const awpRes = await awp.getState();
  const awpPlusPlusRes = await awpPlusPlus.getState();

  const momPlus = awpPlusPlusRes.MoM.map(o => { return {
    awpPlus: (o.roi_percentage_since_start * 100).toFixed(2),
    month: moment(o.month).format('MMMM-YY'),
    date: moment(o.month).format('YYYY-MM-DD'),
  }});

  const mom = awpRes.MoM.map(o => { return {
    awp: (o.roi_percentage_since_start * 100).toFixed(2),
    month: moment(o.month).format('MMMM-YY'),
    date: moment(o.month).format('YYYY-MM-DD'),
  }});

  const comp = compound.map(o => { return {
    ...o,
    compound: (o.rate).toFixed(2),
  }});

  const merged = [
    ...mom.concat(momPlus).concat(comp).reduce((m, o) => 
      m.set(o.month, Object.assign(m.get(o.month) || {}, o)), new Map()
    ).values()
  ];

  const onlyMerged = merged.filter( m => {
    return moment(m.date).isSameOrAfter( moment(m.date).set('date', 29) )
  });

  await ComparisonModel.findOneOrCreate({ until: ctx.params.date }, {until: ctx.params.date, data: onlyMerged});
  ctx.body = onlyMerged;
});

router.get("/comparison/:date", async (ctx: Koa.Context) => {
  const res = await ComparisonModel.findOne({until: ctx.params.date});
  console.log('res', res)
  ctx.body = res.data;
})

router.get("/comparison", async (ctx: Koa.Context) => {
  const chart = new Charts();
  const compound = await chart.getCompoundData();

  const awp = new Portfolio([
    { ratio: 0.3, asset: new Stock('VTI') }, 
    { ratio: 0.4, asset: new Stock('TLT') }, 
    { ratio: 0.15, asset: new Stock('IEI') }, 
    { ratio: 0.075, asset: new Stock('GLD') }, 
    { ratio: 0.075, asset: new Stock('GSG') }, 
  ]);

  const awpPlusPlus = new Portfolio([
    { ratio: 0.27, asset: new Stock('VTI') }, 
    { ratio: 0.36, asset: new Stock('TLT') }, 
    { ratio: 0.135, asset: new Stock('IEI') }, 
    { ratio: 0.0675, asset: new Stock('GLD') }, 
    { ratio: 0.0675, asset: new Stock('GSG') }, 
    { ratio: 0.035, asset: new Crypto('BTC') }, 
    { ratio: 0.035, asset: new Crypto('ETH') },

    { ratio: 0.003333, asset: new Crypto('LINK') }, 
    { ratio: 0.003333, asset: new Crypto('MKR') }, 
    { ratio: 0.003333, asset: new Crypto('ZRX') }, 
    { ratio: 0.003333, asset: new Crypto('SNX') }, 
    { ratio: 0.003333, asset: new Crypto('REN') }, 
    { ratio: 0.003333, asset: new Crypto('LRC') }, 
    { ratio: 0.003333, asset: new Crypto('KNC') }, 
    { ratio: 0.003333, asset: new Crypto('BNT') }, 
    { ratio: 0.003333, asset: new Crypto('MLN') }, 
  ]);

  const awpRes = await awp.getState();
  const awpPlusPlusRes = await awpPlusPlus.getState();
  
  const momPlus = awpPlusPlusRes.MoM.map(o => { return {
    awpPlus: (o.roi_percentage_since_start * 100).toFixed(2),
    month: moment(o.month).format('MMMM-YY'),
    date: moment(o.month).format('YYYY-MM-DD'),
  }});

  const mom = awpRes.MoM.map(o => { return {
    awp: (o.roi_percentage_since_start * 100).toFixed(2),
    month: moment(o.month).format('MMMM-YY'),
    date: moment(o.month).format('YYYY-MM-DD'),
  }});

  const comp = compound.map(o => { return {
    ...o,
    compound: (o.rate).toFixed(2),
  }});

  const merged = [
    ...mom.concat(momPlus).concat(comp).reduce((m, o) => 
      m.set(o.month, Object.assign(m.get(o.month) || {}, o)), new Map()
    ).values()
  ];

  const onlyMerged = merged.filter( m => {
    return moment(m.date).isSameOrAfter( moment(m.date).set('date', 29) )
  });

  ctx.body = onlyMerged;
});

router.get("/compound", async (ctx: Koa.Context) => {
  const chart = new Charts();
  ctx.body = await chart.getCompoundData();
});

router.get("/etf", async (ctx: Koa.Context) => {
  const chart = new Charts();
  ctx.body = await chart.getEtfData();
});

router.get("/subscribers", async (ctx: Koa.Context) => {
  try {
    const response = await axios.get(
      "https://dexlab:" +
      process.env.MAILCHIMP_KEY +
      "@us17.api.mailchimp.com/3.0/lists/a51cc8153c/interest-categories/a192aad95b/interests"
    );
    ctx.body = {
      count: response.data.interests[0].subscriber_count,
    };
  } catch (e) {
    throw new Error('An error occurred while fetching subscribers');
  }
});



export default router;
