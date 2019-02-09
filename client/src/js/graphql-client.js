export default class GraphQLClient {
  constructor(baseURI, options = {}) {
    this.url = baseURI;
    this.options = Object.assign({}, options, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    });
  }

  request(query, variables = {}) {
    const { method, headers, ...rest } = this.options;
    const objParam = Object.assign(
      {},
      {
        method,
        headers,
        body: JSON.stringify({ query, variables }),
        ...rest
      }
    );

    const f = fetch("http://localhost:4000/graphql", objParam)
      .then(res => res.json())
      .then(res => {
        if (!res.error && res.data) {
          return res;
        } else {
          return res.error;
        }
      });

    return f;
  }
}
