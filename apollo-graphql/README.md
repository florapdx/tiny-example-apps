# GraphQL + Apollo example

Builds off the plain-js example, adding an Express GraphQL server with subscriptions support via websockets. The client-side is handled by Apollo Client, which allows us to colocate our data fetching and our UI component code. Follows client-rendered SPA architecture.

* [GraphQL](http://graphql.org/)
* [Apollo](https://www.apollographql.com/)
* [subscription-transport-ws](https://github.com/apollographql/subscriptions-transport-ws): Apollo subscriptions support via websockets transport.
* [React Router v4](https://github.com/ReactTraining/react-router)
* Build via Webpack


#### Resources:
* [NYT considers Relay Modern vs. Apollo](https://medium.com/@wonderboymusic/upgrading-to-relay-modern-or-apollo-ffa58d3a5d59) ...and [decides on Apollo](https://open.nytimes.com/the-new-york-times-now-on-apollo-b9a78a5038c)
