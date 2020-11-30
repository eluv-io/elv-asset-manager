import "./static/stylesheets/app.scss";
import "elv-components-js/src/utils/LimitedMap";

import React from "react";
import {render} from "react-dom";
import {inject, observer, Provider} from "mobx-react";

import * as Stores from "./stores";
import AssetForm from "./components/AssetForm";
import AsyncComponent from "./components/AsyncComponent";
import SpecManagement from "./components/spec/SpecManagement";

if(typeof EluvioConfiguration === "undefined") {
  global.EluvioConfiguration = {};
}

@inject("rootStore")
@observer
class App extends React.Component {
  render() {
    return (
      <div className="app-container">
        <AsyncComponent
          Load={this.props.rootStore.InitializeClient}
          render={() =>
            this.props.rootStore.editingConfiguration ?
              <SpecManagement /> :
              <AssetForm />
          }
        />
      </div>
    );
  }
}

render(
  (
    <React.Fragment>
      <Provider {...Stores}>
        <App />
      </Provider>
    </React.Fragment>
  ),
  document.getElementById("app")
);
