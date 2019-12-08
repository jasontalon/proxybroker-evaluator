const { PROXYBROKER_ENDPOINT } = process.env;

import Axios from "axios";
class ProxyBroker {
  async search(
    countries: string = "US",
    limit: number = 10
  ): Promise<Array<string>> {
    const url = `${PROXYBROKER_ENDPOINT}?countries=${countries}&limit=${limit}`,
      { data } = await Axios.get(url);

    const proxies = data.map((proxy: any) => `${proxy.ip}:${proxy.port}`);
    return proxies;
  }
}
export default ProxyBroker;
