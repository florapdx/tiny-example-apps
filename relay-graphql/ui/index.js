import React from 'react';
import ReactDOM from 'react-dom';
import { Resolver } from 'found-relay';
import {
  Environment,
  RecordSource,
  RecordSourceInspector,
  Store
} from 'relay-runtime';
import { networkLayer } from './network-layer.js';
import Router from './router';
import './css';

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}

const source = new RecordSource();
const store = new Store(source);
// const inspector = new RecordSourceInspector(source);

// Optional for configuring ConnectionHandler and/or ViewHandler,
// neither of which we're using here.
// See https://facebook.github.io/relay/docs/relay-environment.html.
const handlerProvider = null;

const environment = new Environment({
  handlerProvider,
  network: networkLayer,
  store
});

const resolver = new Resolver(environment);

ReactDOM.render(
  <Router resolver={resolver} />,
  document.getElementById('app')
);
