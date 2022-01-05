import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import url from 'url';
import bodyParser from 'body-parser';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { schema } from './schema';

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
  'poloniex': 'STR/BTC',
  'coinmarketcap': 'DASH/USD'
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

app.get('/*', (req, res) => {
  res.sendFile('index.html', {root: 'src'});
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
