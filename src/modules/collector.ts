import Axios from "axios";

const {
  GRAPHQL_ENDPOINT = "",
  GRAPHQL_HEADER_KEY = "",
  GRAPHQL_HEADER_VALUE = ""
} = process.env;

class Collector {
  public results: Number;
  private proxies: Array<string>;
  constructor() {
    this.results = 0;
    this.proxies = [];
  }
  collect(proxies: Array<string>): Collector {
    this.proxies = proxies;
    return this;
  }
  async save(): Promise<Collector> {
    const proxies = JSON.stringify(
      this.proxies.map(proxy => ({ proxy }))
    ).replace(/\"([^(\")"]+)\":/g, "$1:");

    const query = `mutation { insert_proxy(objects: ${proxies}, on_conflict: {constraint: proxy_pkey, update_columns: created_at}) { affected_rows } }`;

    const {
      data: { insert_proxy: { affected_rows = 0 } = {}, errors = null } = {}
    } = await Axios.post(
      GRAPHQL_ENDPOINT,
      { query },
      {
        headers: {
          [GRAPHQL_HEADER_KEY]: GRAPHQL_HEADER_VALUE
        }
      }
    );

    if (errors) throw errors;

    this.results = affected_rows;
    return this;
  }
}

export default Collector;
