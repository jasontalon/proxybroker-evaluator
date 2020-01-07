require("dotenv").config();

import fastify from "fastify";
import Puppeteer from "./puppeteer";
import Manager, { PingResult } from "./manager";
import { Browser } from "puppeteer";

const { PORT = 8080, BROWSER_WS_URL = "" }: EnvironmentVariables = process.env,
  server = fastify({ logger: false });

server.listen(PORT, () => {
  console.log(`listens to port ${PORT}`);
});

server.post("/eval/:proxy", async (req, res) => {
  const {
    params: { proxy = "" },
    body: { url = "" }
  } = req;

  const result = await evaluate(proxy, url);

  const errors = [result.error, result.pingResult.error].filter(p => p);

  if (errors) res.status(400).send(errors);
  return result.pingResult;
});

server.get("/info/:proxy", async (req, res) => {
  const { proxy = "" } = req.params;

  const { error, details } = await getInfo(proxy);

  if (error) res.status(400).send(error);
  return details;
});

interface EnvironmentVariables {
  PORT?: number;
  BROWSER_WS_URL?: string;
}

export async function getInfo(proxy: string) {
  let browser!: Browser, results: any;
  try {
    browser = await new Puppeteer(true, proxy, BROWSER_WS_URL).launch();
    const manager = new Manager(browser);
    results = (await manager.info()) as any;
  } catch (error) {
    results.error = error;
  } finally {
    await browser.close();

    return results;
  }
}

export async function evaluate(proxy: string, url: string) {
  let browser!: Browser, pingResult!: PingResult, error: any;
  try {
    browser = await new Puppeteer(true, proxy, BROWSER_WS_URL).launch();
    const manager = new Manager(browser);
    pingResult = await manager.ping(url);
  } catch (err) {
    error = err;
  } finally {
    await browser.close();

    return { error, pingResult };
  }
}
