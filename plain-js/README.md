# Plain JS example

Minimal app rendering a couple of views with ticker data from ccxt.

Base server implementation:

* Express
* Redis pubsub clients
* [uWebSockets](https://github.com/uNetworking/uWebSockets)
* [fast-json-stringify](https://github.com/fastify/fast-json-stringify) for fast JSON stringification of data we get from ccxt _which come to us as decoded JSON objects_

Part of the purpose of the "plain-js" test case is to run tests against the websocket layer itself. There are plenty of existing benchmarking tests on uWebsockets vs other socket frameworks, so we're just going to test data encoding here. To that end, there is a test file for running JSON encoding/decoding benchmarks in `/cli` (see results in the top-level `results` directory).

## Install and run

`$ npm install && npm start`

Navigate to [localhost:3000](http://localhost:3000).

