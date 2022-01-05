// Common b/c we need to run this through Node generate-graphql script
var pubsub = require('./server/pubsub').pubsub;

var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLFloat = require('graphql').GraphQLFloat;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLSchema = require('graphql').GraphQLSchema;

/*
 * Resolvers
 * Resolver methods accept the arguments: (obj, args, context):
 *  - obj: previous object, often not used for a field on root Query type
 *  - args: args passed to the resolver, such as `id` &/or input data
 *  - context: context object passed through from server [here { db, pubsub }]
 *  - info: information about the execution state of the query
 *      (see: https://github.com/graphql/graphql-js/blob/c82ff68f52722c20f10da69c9e50a030a1f218ae/src/type/definition.js#L489-L500)
 * Fields may return either a function that returns an object or a plain object.
 * The reason you might want to return a function is to manage circular dependencies
 * among types.
 */

const getTicker = (_, { symbol }, { db }) => {
  const ticker = db.get(symbol) || {};
  if (!ticker) {
    console.log('no ticker exists for this id');
  }
  return { ...ticker };
};

/*
 * Custom type definitions
 */
const tickerType = new GraphQLObjectType({
  name: 'Ticker',
  description: 'A ticker for a single currency on a single exchange',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    symbol: {
      type: GraphQLString,
      description: 'ticker symbol',
      resolve: ticker => ticker.symbol,
    },
    timestamp: { // Int cannot represent non 32-bit signed integer value
      type: GraphQLString,
      description: 'ticker data timestamp',
      resolve: ticker => ticker.timestamp.toString(),
    },
    datetime: {
      type: GraphQLString,
      description: 'ticker data datetime',
      resolve: ticker => ticker.datetime,
    },
    high: {
      type: GraphQLFloat,
      description: 'ticker high point',
      resolve: ticker => ticker.high,
    },
    low: {
      type: GraphQLFloat,
      description: 'ticker low point',
      resolve: ticker => ticker.low,
    },
    bid: {
      type: GraphQLFloat,
      description: 'ticker bid price',
      resolve: ticker => ticker.bid,
    },
    ask: {
      type: GraphQLFloat,
      description: 'ticker ask price',
      resolve: ticker => ticker.ask,
    },
    vwap: {
      type: GraphQLFloat,
      description: 'Volume-weighted object',
      resolve: ticker => ticker.vwap,
    },
    open: {
      type: GraphQLFloat,
      description: 'ticker opening price',
      resolve: ticker => ticker.open,
    },
    last: {
      type: GraphQLFloat,
      description: 'ticker last price',
      resolve: ticker => ticker.last,
    },
    baseVolume: {
      type: GraphQLFloat,
      description: 'ticker base volume',
      resolve: ticker => ticker.baseVolume,
    },
    quoteVolume: {
      type: GraphQLFloat,
      description: 'ticker quote volume',
      resolve: ticker => ticker.quoteVolume,
    }
  })
});

/*
 * Base types
 */
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    ticker: {
      type: tickerType,
      args: {
        symbol: {
          type: GraphQLString
        }
      },
      resolve: (obj, args, context) => getTicker(obj, args, context)
    },
    allTickers: {
      type: new GraphQLList(tickerType),
      resolve: (obj, args, context) => {
        return Object.keys(context.db.store).map(key => context.db.get(key));
      }
    }
  })
});

const subscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    ticker: {
      type: tickerType,
      args: {
        symbol: {
          type: GraphQLString
        }
      },
      subscribe: (obj, args, context) =>
        pubsub.returnAsyncIterator(`ticker:${args.symbol}`)
    }
  })
});

module.exports = new GraphQLSchema({
  query: queryType,
  subscription: subscriptionType
});
