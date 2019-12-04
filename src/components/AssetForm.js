import React from "react";
import {inject, observer} from "mobx-react";
import ContentBrowser from "./ContentBrowser";

@inject("rootStore")
@observer
class AssetForm extends React.Component {
  render() {
    return (
      <ContentBrowser />
    );
  }
}

export default AssetForm;
