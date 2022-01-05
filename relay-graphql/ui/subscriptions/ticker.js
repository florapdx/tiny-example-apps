const subscription = graphql`
  subscription tickerSubscription($symbol: String!) {
    ticker(symbol: $symbol) {
      ...Ticker_ticker
    }
  }
`;

const TickerSubscription = (environment, { symbol }) => {
  return {
    subscription,
    variables: { symbol },
    onCompleted: payload => {
      console.log("Ticker subscription payload: ", payload);
    },
    onError: error => {
      console.log("Ticker subscription error: ", error);
    }
  }
}

export default TickerSubscription;
