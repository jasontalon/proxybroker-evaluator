require("dotenv").config();
import Manager from "../src/manager";
import ProxyBroker from "../src/modules/proxybroker";
import Reporter from "../src/reporter";
describe("test main app", () => {
  it.only("should eval proxies", async () => {
    const proxies = await new ProxyBroker().search("US", 10);
    const manager = new Manager();

    new Reporter().listen(manager.announcement);

    await manager
      .receive(proxies)
      .inspect()
      .then(i => i.evaluate())
      .then(i => i.collect());

    debugger;
  }, 300000);
});
