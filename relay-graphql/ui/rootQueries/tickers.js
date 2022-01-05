// Top-level QueryRenderer queries for routes

const TickersQuery = graphql`
  query tickersQuery {
    allTickers {
      ...Tickers_allTickers
    }
  }
`;

export default TickersQuery;
