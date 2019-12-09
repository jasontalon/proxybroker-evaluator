import { Result } from "./inspector";

class Evaluator {
  public results: Array<ProxyInspectionResult>;
  private proxies: Array<ProxyInspectionResult>;
  constructor() {
    this.results = [];
    this.proxies = [];
  }
  receive(proxies: Array<ProxyInspectionResult>): Evaluator {
    this.proxies = proxies;
    return this;
  }
  evaluate(): Evaluator {
    this.results = this.proxies.map(proxy => {
      const { result } = proxy;
      if (result! != null) {
        const hasErrorsInIpLookup = result!.ip.error,
          hasErrorsInPing = result!.ping.some(p => p.error),
          titles = result!.ping.map(p => p.data.title).join("||"),
          blocked = /(access denied|attention required|restrict|robot check|security check required)/gim.test(
            titles
          );
        proxy.passed = !hasErrorsInIpLookup && !hasErrorsInPing && !blocked;
      } else proxy.passed = false;

      return proxy;
    });
    return this;
  }
}

export default Evaluator;

export interface ProxyInspectionResult {
  proxy: string;
  result: Result | null;
  passed: boolean;
}
