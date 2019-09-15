import React from 'react';
import ReactDOM from 'react-dom';
import { Header } from './components/pages/Header';
import { Videos } from './components/pages/Videos';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Customizer, mergeStyles } from 'office-ui-fabric-react';
import { HashRouter, Route } from "react-router-dom";

import * as serviceWorker from './serviceWorker';
import {RootContextProvider} from './context/root';

// Inject some global styles
mergeStyles({
  selectors: {
    ':global(body), :global(html), :global(#root)': {
      margin: 0,
      padding: 0,
      height: '100vh',
      background: "#333333"
    }
  }
});

ReactDOM.render(
  <RootContextProvider>
    <Customizer {...FluentCustomizations}>
      <HashRouter>
        <Route path="/" component={Header}/>
        <Route path="/videos" component={Videos}/>
      </HashRouter>   
    </Customizer>
  </RootContextProvider>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
