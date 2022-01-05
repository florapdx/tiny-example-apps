import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import url from 'url';
import bodyParser from 'body-parser';

import React from 'react';
import fetch from 'node-fetch';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { StaticRouter } from 'react-router';
import Routes from '../ui/routes';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import schema from '../schema';

import { SubscriptionServer } from 'subscriptions-transport-ws';
import { pubsub } from './pubsub';

import { getTicker, getTickers } from './api';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';

const PORT = 3000;

const exchangeMap = {
  'gemini': 'ETH/USD',
  'gdax': 'BTC/USD',
  'cex': 'ETH/BTC',
  'kraken': 'LTC/USD',
  'poloniex': 'STR/BTC'
};

/* Create app */
const app = express();

const createServer = env === 'development' ? http.createServer :
  https.createServer;

/* Create servers */
const server = createServer(app);

app.use(cors());
app.use(express.static('build'));

// Fake it till you make it
class FakeDB {
  constructor() {
    this.store = {};
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  get(id) {
    return this.store[id] ? JSON.parse(this.store[id]) || null : null
  }

  set(id, input) {
    this.store[id] = input;
  }
}

const db = new FakeDB();

// Mount graphQL HTTP server on '/graphql' route.
// Added extension to return the graphQL request execution time.
// Passes data store and pubsub engine via `context`.
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  rootValue: {},
  context: { db, pubsub},
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack,
    path: error.path,
  }),
  tracing: true,
  debug: true,
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${PORT}/graphql`
}));

function Html({ content, state }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <title>Ticker test app</title>
        <meta name="description" content="test A/B message generation and display" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <div className="main">
          <h1 style={{marginLeft: '40px'}}>Ticker test app: GraphQL/Apollo, server side rendered</h1>
          <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
        }} />
        <script type="text/javascript" src="./ui/bundle.js"></script>
      </body>
    </html>
  );
}

app.get('/*', (req, res) => {
  // From Apollo SSR docs:
  // You need to ensure that you create a new client or store instance
  // for each request, rather than re-using the same client for multiple
  // requests. Otherwise the UI will be getting stale data and you’ll
  // have problems with authentication.
  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: 'http://localhost:3000',
      fetch
    }),
    cache: new InMemoryCache()
  });

  const context = {};

  const app = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.url} context={context}>
        <div className="main">
          <Routes />
        </div>
      </StaticRouter>
    </ApolloProvider>
  );

  getDataFromTree(app).then(() => {
    const content = renderToString(app);
    const initialState = client.cache.extract();
    const html = <Html content={content} state={initialState} />;

    res.status(200);
    res.send(`<!doctype html>\n${renderToStaticMarkup(html)}`);
    res.end();
  });
});

const pullData = () => setInterval(() => {
  Object.keys(exchangeMap).forEach(exchange => {
    getTicker(exchange, exchangeMap[exchange])
      .then(resp => {
        if (resp) {
          return JSON.parse(resp);
        }
      }).then(parsed => {
        if (parsed) {
          const coinKey = exchangeMap[exchange]
            .toLowerCase()
            .replace('/', '-');
          parsed.id = coinKey;
          db.set(coinKey, JSON.stringify(parsed));

          pubsub.publish(`ticker:${coinKey}`, JSON.stringify({
            ticker: parsed
          }));
        }
      });
  });
}, 1000);

server.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Server running at ${address === '::' ? 'localhost' : address} on port ${port}`);
  pullData();
});

// Add pubsub to our subscription server context
const onConnect = () => {
  return { pubsub };
};

const subscriptionServer = SubscriptionServer.create({
  execute,
  subscribe,
  schema,
  onConnect,
}, {
  server,
  path: '/graphql',
});

/* Stop pulling data */
server.on('close', () => {
  clearInterval(pullData);
});
