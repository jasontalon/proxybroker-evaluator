require("dotenv").config();

import Inspector from "../src/modules/inspector";
import { Browser } from "puppeteer";
import Puppeteer from "../src/modules/puppeteer";

describe.skip("test inspector", testInspector);

function testInspector() {
  let browser: Browser;

  const { BROWSER_WS_ENDPOINT = "" } = process.env;

  beforeEach(async () => {
    browser = await new Puppeteer()
      .setBrowserWSEndpoint(BROWSER_WS_ENDPOINT)
      .setHeadless(false)
      .launch();
  });

  afterEach(async () => {
    browser.close();
  });

  it("should initialize inspector", () => {
    const inspector = new Inspector(browser);
    expect(inspector).toEqual(expect.anything());
  });

  it("should ping site", async () => {
    const inspector = new Inspector(browser);
    const { result } = await inspector.ping("https://www.duckduckgo.com/");

    expect(result).toEqual(expect.anything());
  }, 60000);

  it("should lookup ip address", async () => {
    const inspector = new Inspector(browser);
    const { result } = await inspector.lookupAddress();

    expect(result).toEqual(expect.anything());
  }, 60000);

  it("should lookup ip address AND ping", async () => {
    const inspector = new Inspector(browser);
    const { result } = await inspector
      .lookupAddress()
      .then(i => i.ping("https://icanhazip.com/"));

    expect(result).toEqual(expect.anything());
  }, 60000);
}
