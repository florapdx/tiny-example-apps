import React, { Component } from 'react';

const Link = (props) => <a href={props.to}>{props.children}</a>;

class Index extends Component {
  constructor() {
    super();
  }

  render () {
    return (
      <div className="home">
        <Link to="/">Home</Link>
        <Link to="/tickers">Tickers</Link>
        {this.props.children}
      </div>
    );
  }
}

export default Index;