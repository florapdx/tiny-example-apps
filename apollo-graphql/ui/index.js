import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';

import './css';

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}

const GRAPHQL_ENDPOINT = `${window.location.origin}/graphql`;
const GRAPHQL_WS_ENDPOINT = `ws://${window.location.host}/graphql`;

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT
});

const wsLink = new WebSocketLink(new SubscriptionClient(
  GRAPHQL_WS_ENDPOINT,
  { reconnect: true }
));

const client = new ApolloClient({
  link: split(({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
    wsLink,
    httpLink,
  ),
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <div className="main">
        <Routes />
      </div>
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('app')
);
