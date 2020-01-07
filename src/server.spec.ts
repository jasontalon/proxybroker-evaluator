import { getInfo, evaluate } from "./server";

describe("test manager", () => {
  it("should test ip info", async () => {
    const proxy = "157.245.61.250:8080";

    const { details } = await getInfo(proxy);

    expect(details).toEqual(expect.anything());
  }, 60000);

  it("should test ip info", async () => {
    const proxy = "157.245.61.250:8080",
      url = "https://www.duckduckgo.com/";

    const { pingResult } = await evaluate(proxy, url);

    expect(pingResult.data).toEqual(expect.anything());
  }, 60000);
});
