import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import url from 'url';
import uws from 'uws';

import graphQLHTTP from 'express-graphql';
import { schema } from './schema';

import RedisGraphQLPubSub from './subscriptions-redis';
import { createSubscriptionServer } from './subscriptions-server-ws';

import { getTicker, getTickers } from './api';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';

const PORT = 3000;

const exchangeMap = {
  'gdax': 'BTC/USD',
  'gdax': 'LTC/USD',
  'kraken': 'ETH/USD',
  'poloniex': 'STR/BTC',
  'gemini': 'ETH/BTC',
  'coinmarketcap': 'DASH/USD',
  'cex': 'BTC/EUR'
};

/* Create app */
const app = express();

/* Create servers */
const server = env === 'development' ? http.createServer(app) :
  https.createServer(app);
const wsServer = new uws.Server({ server });
const graphQLWS = createSubscriptionServer(wsServer, schema);

app.use(cors());
app.use(express.static('build'));

const pubsub = new RedisGraphQLPubSub();

// Fake it till you make it
class FakeDB {
  constructor() {
    this.store = {};
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
app.use('/graphql', graphQLHTTP(request => {
  const startTime = Date.now();
  return {
    schema,
    rootValue: {},
    graphiql: true,
    context: { db },
    extensions({ document, variables, operationName, result }) {
      return `${Date.now() - startTime}`;
    },
    formatError: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack,
      path: error.path
    })
  };
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
        const coinKey = exchangeMap[exchange].toLowerCase().replace('/', '-');
        parsed.id = coinKey;
        db.set(coinKey, JSON.stringify(parsed));
        pubsub.publish(`${exchangeMap[exchange]}_TOPIC`, JSON.stringify(parsed));
      });
  });
}, 1000);

server.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Server running at ${address === '::' ? 'localhost' : address} on port ${port}`);
  pullData();
});

/* Stop pulling data */
server.on('close', () => {
  clearInterval(pullData);
  wsServer.close(() => {
    console.log('Server closing. Closing WebSocket server.');
  });
});
