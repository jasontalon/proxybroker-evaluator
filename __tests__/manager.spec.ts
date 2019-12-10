require("dotenv").config();
import Manager from "../src/modules/manager";
import ProxyBroker from "../src/modules/proxybroker";
import Reporter from "../src/modules/reporter";
describe("test main app", () => {
  it("should eval proxies", async () => {
    const proxies = await new ProxyBroker().search("US", 20);
    const manager = new Manager();

    new Reporter().listen(manager.announcement);

    await manager
      .receive(proxies)
      .check()
      .then(i => i.inspect())
      .then(i => i.evaluate())
      .then(i => i.collect());

    debugger;
  }, 300000);
});
