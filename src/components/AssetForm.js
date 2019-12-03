import React from "react";
import {inject, observer} from "mobx-react";

@inject("rootStore")
@observer
class AssetForm extends React.Component {

  render() {
    return <h1>in</h1>;
  }
}

export default AssetForm;
