require("dotenv").config();

import Inspector from "../src/modules/inspector";
import { Browser } from "puppeteer";
import Puppeteer from "../src/modules/puppeteer";

describe.skip("test inspector", testInspector);

function testInspector() {
  const { BROWSER_WS_ENDPOINT = "" } = process.env;

  it("should initialize inspector", async () => {
    const inspector = new Inspector(await initBrowser());
    expect(inspector).toEqual(expect.anything());
  });

  it("should ping site", async () => {
    const inspector = new Inspector(await initBrowser(), 15000);
    const { result } = await inspector.ping("https://www.cloudflare.com/");

    expect(result).toEqual(expect.anything());
  }, 60000);

  it("should lookup ip address", async () => {
    const inspector = new Inspector(await initBrowser());
    const { result } = await inspector.lookupAddress();

    expect(result).toEqual(expect.anything());
  }, 60000);

  test.each([
    ["167.99.108.157:3128"],
    ["198.98.54.241:8080"],
    ["8.209.80.128:3128"]
  ])(
    "should lookup ip address AND ping %s %s",
    async (proxy: any) => {
      const browser = await initBrowser("", true);

      const inspector = new Inspector(browser, 15000);
      const { result } = await inspector
        .lookupAddress()
        .then(i => i.ping("https://www.cloudflare.com/"))
        

      await browser.close();

      expect(result).toEqual(expect.anything());
      debugger;
    },
    60000
  );

  async function initBrowser(
    proxy = "",
    useBrowserless: boolean = false
  ): Promise<Browser> {
    return await new Puppeteer()
      .setBrowserWSEndpoint(useBrowserless ? BROWSER_WS_ENDPOINT : "")
      .setHeadless(false)
      .setProxy(proxy)
      .launch();
  }
}
