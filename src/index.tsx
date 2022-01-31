import React from "react";
import ReactDOM from "react-dom";
import { Header } from "./components/pages/Header";
import { Videos } from "./components/pages/Videos";
import { FluentCustomizations } from "@uifabric/fluent-theme";
import { Customizer, initializeIcons, mergeStyles } from "office-ui-fabric-react";
import { HashRouter, Route } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";
import { RootContextProvider } from "./context/root";

const gui = require("nw.gui");
const win = gui.Window.get();
const rimraf = require("rimraf");

win.setMinimumSize(800, 450);
// win.showDevTools();

// Ah... Fluent/Fabric UI... Never change...
initializeIcons();

win.on("close", () => {
  const rootPath = `${process.cwd()}/`;
  const tmpDirPath = `${rootPath}temp/`;

  win.hide();
  // Delete temp image folder when closing the application.
  rimraf.sync(tmpDirPath);
  win.close(true);
});

// Global styles.
mergeStyles({
  selectors: {
    ":global(body), :global(html), :global(#root)": {
      margin: 0,
      padding: 0,
      height: "100vh",
      background: "#333333",
    },
  },
});

ReactDOM.render(
  <RootContextProvider>
    <Customizer {...FluentCustomizations}>
      <HashRouter>
        <Route path="/" component={Header} />
        <Route path="/videos" component={Videos} />
      </HashRouter>
    </Customizer>
  </RootContextProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
