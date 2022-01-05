## Redux + React example

Builds off of the plain-js app, adding React components and Redux for the client-side application layer. Follows client-rendered SPA architecture.

* [React](https://reactjs.org/)
* [Redux](https://redux.js.org/)
* [React Router v4](https://reacttraining.com/react-router/)
* Built via Webpack

Redux provides a predictable state container and enforces one-way data flow through your application by limiting state change to a single location. Requests for data and requests to change data are communicated through `action creators` that are handled by sync or async `action` handlers that can do things like call your api, communicate state updates to your state tree (or `store` in Redux parlance). The paradigm Redux enforces is: `previousState + action = newState`.

Redux comes with some nifty developer tooling including hot-reload and time-travel debugger support that allows you to see exactly how data is moving through your app. Basic functionality can be extended through the addition of middlewares.

## Install and run

`$ npm install && npm start`

## Build and watch tasks
`$ npm run build`
`$ npm run watch`
