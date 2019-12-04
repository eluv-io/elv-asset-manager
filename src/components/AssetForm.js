import React from "react";
import {inject, observer} from "mobx-react";
import Clips from "./Clips";

@inject("rootStore")
@observer
class AssetForm extends React.Component {
  render() {
    return (
      <div className="asset-form">
        <h1>Manage '{this.props.rootStore.assetName}'</h1>
        <Clips storeKey="clips" header="Clips" name="Clip" assetTypes={["trailer"]}/>
        <Clips storeKey="trailers" header="Trailers" name="Trailer" assetTypes={["trailer"]}/>
      </div>
    );
  }
}

export default AssetForm;
