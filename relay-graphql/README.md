# GraphQL + Relay example

[Note: this example isn't finished. Couldn't get subscriptions working in a reasonable amount of time, and had a generally difficult time with the Relay API so this effort was abandoned in favor of the Apollo examples.]

Builds off the plain-js example, adding an Express GraphQL server with subscriptions support via websockets. The client-side is handled by Relay Modern, which allows us to colocate our data fetching and our UI component code. Follows client-rendered SPA architecture.

* [GraphQL](http://graphql.org/)
* [Relay Modern](https://facebook.github.io/relay/)
* [Found](https://github.com/4Catalyzer/found) and [Found-Relay](https://github.com/4Catalyzer/found-relay) for routing
* Build via Webpack

#### Resources:
* [NYT considers Relay Modern vs. Apollo](https://medium.com/@wonderboymusic/upgrading-to-relay-modern-or-apollo-ffa58d3a5d59)
* [Found doesn't yet work with React Native](https://github.com/4Catalyzer/found/issues/133)
* [Alternative react implementation for x-platform](https://github.com/entria/ReactNavigationRelayModern/issues/11), depending on how serious we are about mobile
