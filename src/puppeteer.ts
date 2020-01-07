import puppeteer, { Browser } from "puppeteer";
import { hasQueryString } from "./util";
class Puppeteer {
  constructor(
    private headless: boolean = true,
    private proxy: string = "",
    private browserWSEndpoint: string = "",
    private args: string[] = []
  ) {}

  setHeadless(headless: boolean): Puppeteer {
    this.headless = headless;
    return this;
  }

  setProxy(proxy: string): Puppeteer {
    this.proxy = proxy;
    return this;
  }

  setBrowserWSEndpoint(browserWSEndpoint: string): Puppeteer {
    this.browserWSEndpoint = browserWSEndpoint;
    if (this.browserWSEndpoint) this.headless = true;
    return this;
  }

  setArgs(args: string[]): Puppeteer {
    this.args = args;
    return this;
  }

  async launch(): Promise<Browser> {
    const { args, headless, browserWSEndpoint, proxy } = this;

    if (proxy) args.push(`--proxy-server=${proxy}`);
    if (!proxy && !browserWSEndpoint && args.length == 0) {
      return await puppeteer.launch({
        headless
      });
    }

    if (browserWSEndpoint) {
      const connector = hasQueryString(browserWSEndpoint) ? "&" : "?";

      const endpoint =
        browserWSEndpoint + (args.length > 0 ? connector + args.join("&") : "");
      return await puppeteer.connect({
        browserWSEndpoint: endpoint
      });
    } else {
      return await puppeteer.launch({ headless, args });
    }
  }
}

export default Puppeteer;
