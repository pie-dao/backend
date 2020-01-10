import { ethers } from "ethers";
import * as colors from 'colors/safe';
import DB from './db';
import config from './config';
import Stock from './managers/Stock';
import Uniswap from './managers/uniswap';

const H24: number = 86400000;
const H1: number = 3600000;
const M5: number = 300000;
const S15: number = 15000;

const rainbow = (t) => global.console.log(colors.rainbow(t));
const title = (t) => global.console.log(colors.red(colors.underline(t)));
const subtitle = (t) => global.console.log(colors.yellow(t));
const log = (t) => global.console.log(colors.magenta(t));



class Collector {
    public provider;
    public network;
    public blockNumber: number;

    private VTI: Stock;
    private TLT: Stock;
    private IEI: Stock;
    private GLD: Stock;
    private GSG: Stock;

    public async setup() {
        rainbow("Setting up data collector process...");

        this.provider = ethers.getDefaultProvider();
        this.network = await this.provider.getNetwork();

        this.VTI = new Stock('VTI');
        this.TLT = new Stock('TLT');
        this.IEI = new Stock('IEI');
        this.GLD = new Stock('GLD');
        this.GSG = new Stock('GSG');
    }

    public async collectAllRates() {
        const blockNumber = await this.provider.getBlockNumber();

        subtitle("The block number is now: " + blockNumber);

        if (this.blockNumber !== blockNumber) {
            this.blockNumber = blockNumber;
        }
    }

    public async collectDailyPriceFeed() {
        title("--- ETF recording ---");
        await this.collectAndStoreStock(this.VTI);
        await this.collectAndStoreStock(this.TLT);
        await this.collectAndStoreStock(this.IEI);
        await this.collectAndStoreStock(this.GLD);
        await this.collectAndStoreStock(this.GSG);
    }

    private async collectAndStoreStock(stock: Stock) {
        subtitle(`Collecting and Storing Stock: ${stock.ticker} data`);
        const res = await stock.getRatesDay();
        log(`Last checked: ${res.last_refreshed}`);
        global.console.table(res);
        await stock.storeRates(res);
    }

    private collectAndStoreDydx() {
        global.console.log("");
    }
}

(async () => {
    await DB();
    const collector = new Collector();
    await collector.setup();

    setInterval(() => collector.collectAllRates(), M5);
    collector.collectAllRates()
    collector.collectDailyPriceFeed()
    setInterval(() => collector.collectDailyPriceFeed(), M5);

    const uniswaps = [];
    const uniswapProvider = ethers.getDefaultProvider(config.UNISWAP_NETWORK);

    config.UNISWAP_TOKENS.split(',').forEach((token) => {
      uniswaps.push(new Uniswap(token, uniswapProvider));
    });
})();
