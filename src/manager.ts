import { Browser, Page } from "puppeteer";
import moment, { Moment } from "moment";
import { getDuration } from "./util";
export default class Manager {
  constructor(private browser: Browser, private timeout: number = 30000) {}

  async info(): Promise<Object> {
    const page: Page = await this.browser!.newPage();

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

      return { error, details };
    }
  }

  async ping(url: string): Promise<PingResult> {
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

      return {
        duration,
        data,
        error,
        url
      };
    }
  }
}

export interface PingResult {
  duration: string;
  data: { title: string; body: string };
  error: string;
  url: string;
}
