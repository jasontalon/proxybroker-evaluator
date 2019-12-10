import Evaluator, { ProxyInspectionResult } from "./evaluator";
import Inspector, { Result } from "./inspector";
import Puppeteer from "./puppeteer";
import { Browser } from "puppeteer";
import Collector from "./collector";
import { EventEmitter } from "events";

const { BROWSER_WS_ENDPOINT = "" } = process.env;

export default class Manager {
  private proxies: Array<string>;
  private inspector: { results: Array<ProxyInspectionResult> };
  private evaluator: { results: Array<ProxyInspectionResult> };
  private collector: { results: Number };
  public announcement: EventEmitter;

  constructor() {
    this.proxies = [];
    this.inspector = { results: [] };
    this.evaluator = { results: [] };
    this.collector = { results: 0 };
    this.announcement = new EventEmitter();
  }

  receive(proxies: Array<string>): Manager {
    this.proxies = proxies;
    this.announcement.emit("receive", proxies);
    return this;
  }

  async inspect(): Promise<Manager> {
    const total = this.proxies.length;
    for (let current = 0; current < total; current++) {
      const proxy = this.proxies[current];
      this.announcement.emit("pre-inspect", {
        proxy,
        current : current + 1,
        total
      });
      const result: ProxyInspectionResult = {
        passed: false,
        proxy,
        result: await this.doInspect(proxy)
      };
      this.announcement.emit("post-inspect", { proxy, result, current : current + 1, total });
      this.inspector.results.push(result);
    }

    return this;
  }

  evaluate(): Manager {
    const { results } = new Evaluator()
      .receive(this.inspector.results)
      .evaluate();
    this.announcement.emit(
      "evaluate",
      results.map(p => ({ proxy: p.proxy, passed: p.passed }))
    );
    this.evaluator.results = results;
    return this;
  }

  async collect(): Promise<Manager> {
    const goodProxies = this.evaluator.results
      .filter(p => p.passed)
      .map(p => p.proxy);
    const { results } = await new Collector().collect(goodProxies).save();
    this.collector.results = results;
    this.announcement.emit("collect", results);
    return this;
  }

  private async doInspect(proxy: string): Promise<Result | null> {
    let browser: Browser;
    try {
      browser = await new Puppeteer(false, proxy, BROWSER_WS_ENDPOINT).launch();
      const timeoutMs: number = 10000,
        inspector = new Inspector(browser, timeoutMs),
        { result } = await inspector
          .lookupAddress()
          .then(i => i.ping("https://www.cloudflare.com/")) 
          .then(i => i.ping("https://www.facebook.com/RoyalBotanicGarden/"));

      return result;
    } catch (err) {
      this.announcement.emit("error", JSON.stringify(err));
      return null;
    } finally {
      if (browser!) browser!.close();
    }
  }
}
