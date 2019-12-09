import { Browser, Page } from "puppeteer";
import moment, { Moment } from "moment";
import { getDuration } from "../util";

class Inspector {
  public result: Result;

  constructor(private browser: Browser, private timeout: number = 30000) {
    this.result = {
      ping: [],
      ip: { error: "", details: {}, duration: "" }
    };
  }
  async ping(url: string): Promise<Inspector> {
    const page: Page = await this.browser!.newPage(),
      startTime: Moment = moment();
    let error: string = "",
      data: { title: string; body: string } = { title: "", body: "" };
    try {
      page.setDefaultTimeout(this.timeout);

      await page.goto(url, { waitUntil: "domcontentloaded" });
      data = {
        title: await page.title(),
        body: await page.$eval("body", el => (el as HTMLElement).innerText)
      };
    } catch (err) {
      error = err.toString();
    } finally {
      await page.close();
      const duration = getDuration(startTime);
      this.result.ping.push({
        duration,
        data,
        error,
        url
      });
      return this;
    }
  }

  async lookupAddress(): Promise<Inspector> {
    const page: Page = await this.browser!.newPage(),
      startTime: Moment = moment();
    let details: Object = {},
      error: string = "";
    try {
      page.setDefaultTimeout(this.timeout);
      await page.setViewport({ width: 1366, height: 768 });
      await page.goto("https://ipstack.com/", {
        waitUntil: "domcontentloaded"
      });
      const response = await page.waitForResponse(response =>
        response.url().includes("https://ipstack.com/ipstack_api.php")
      );
      details = (await response.json()) as Object;
    } catch (err) {
      error = err.toString();
    } finally {
      await page.close();
      const duration = getDuration(startTime);
      this.result.ip = {
        duration,
        error,
        details
      };
      return this;
    }
  }
}

export interface PingResult {
  url: string;
  data: { title: string; body: string };
  duration: string;
  error: string;
}

export interface Result {
  ping: Array<PingResult>;
  ip: { details: Object; error: string; duration: string };
}

export default Inspector;
