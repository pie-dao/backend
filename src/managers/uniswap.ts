import BigNumber from 'bignumber.js';
import Rates from './rates';
import * as colors from 'colors/safe';
import { ethers } from 'ethers';
import { uniswapExchangeABI } from '../../contracts/uniswapExchangeABI';
import { UniswapModel } from '../models/Uniswap';

const rainbow = (t) => global.console.log(colors.rainbow(t));
const title = (t) => global.console.log(colors.red(colors.underline(t)));
const subtitle = (t) => global.console.log(colors.yellow(t));
const log = (t) => global.console.log(colors.magenta(t));

const ONE_ETH = ethers.utils.parseEther('1.0');
const PRICE_CHECK_INTERVAL = 60000;

export default class Uniswap {
  private _address: string;
  private _contract: ethers.Contract;
  private _lastPrice: BigNumber;
  private _pid: any;
  private _provider: any;
  private _rates: Rates;

  constructor(address: string, provider: any) {
    rainbow(`Setting up Uniswap long polling for ${address}...`);
    this._address = address;
    this._contract = new ethers.Contract(address, uniswapExchangeABI, provider);
    this._lastPrice = new BigNumber(0);
    this._provider = provider;
    this._rates = new Rates;

    setTimeout(() => this.start(), 0);
  }

  public get address(): string {
    return this._address;
  }

  public get contract(): ethers.Contract {
    return this._contract;
  }

  public get price(): BigNumber {
    return this._lastPrice;
  }

  public get provider(): any {
    return this._provider;
  }

  public async start() {
    this.updatePrice();

    this._pid = setInterval(() => this.updatePrice(), PRICE_CHECK_INTERVAL);
  }

  public stop() {
    clearInterval(this._pid);
    delete this._pid;
  }

  private async storePrice() {
    const { address, price, provider } = this;
    const block = await provider.getBlockNumber();

    const data = { spot: price.toFixed() };

    log(data);
    title(await UniswapModel.findOneOrCreate({ address, block }, { address, block, data }));
  }

  private async updatePrice() {
    const { _lastPrice, address, contract } = this;

    subtitle(`Running price update check for ${address}`);

    const tokensForOneETH = (await contract.getEthToTokenInputPrice(ONE_ETH)).toString();
    const newPrice = new BigNumber(tokensForOneETH);

    if (!_lastPrice.isEqualTo(newPrice)) {
      log(`Price update received. 1 ETH on ${address} Exchange gets you ${newPrice.toFixed()}`);
      this._lastPrice = newPrice;
      this.storePrice();
    }
  }
}
