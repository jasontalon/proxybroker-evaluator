import { getInfo } from "./server";

describe("test server", () => {
  it("should test ip info", async () => {
    const proxy = "157.245.61.250:8080";

    const info = await getInfo(proxy);

    console.log(info);
  }, 60000);
});
