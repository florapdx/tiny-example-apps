// Top-level QueryRenderer queries for routes

const TickerQuery = graphql`
  query tickerQuery($symbol: String!) {
    ticker(symbol: $symbol) {
      ...Ticker_ticker
    }
  }
`;

export default TickerQuery;
