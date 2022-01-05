import { Network } from 'relay-runtime';
import { SUBSCRIBE, UNSUBSCRIBE } from '../constants';

const WEBSOCKET_URL = 'ws://localhost:3000/graphql';

const socket = new WebSocket(WEBSOCKET_URL);

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables
) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: operation.text,
      variables
    }),
  }).then(resp => resp.json());
}

function subscribeToQuery(
  operation,
  variables,
  cacheConfig,
  observer
) {
  const { onNext, onCompleted, onError } = observer;

  socket.send(SUBSCRIBE, {
    query: operation.text,
    variables
  });

  socket.addEventListener('message', resp => onNext({
    ...resp,
    errors: []
  }));

  return {
    dispose: () => socket.close()
  };
}

export const networkLayer = Network.create(fetchQuery, subscribeToQuery);
