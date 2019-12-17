import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm} from "elv-components-js";
import Clips from "./Clips";
import Titles from "./Titles";
import Images from "./Images";
import AssetInfo from "./AssetInfo";
import Gallery from "./Gallery";
import Playlists from "./Playlists";

@inject("rootStore")
@inject("formStore")
@observer
class AssetForm extends React.Component {
  render() {
    return (
      <div className="asset-form">
        <h1>Manage '{this.props.rootStore.assetName}'</h1>
        <Action
          className="asset-form-save-button"
          onClick={async () => {
            await Confirm({
              message: "Are you sure you want to save your changes?",
              onConfirm: this.props.formStore.SaveAsset
            });
          }}
        >
          Save
        </Action>
        <div className="asset-form-container">
          <AssetInfo />
          <Clips storeKey="clips" header="Clips" name="Clip" assetTypes={["trailer"]}/>
          <Clips storeKey="trailers" header="Trailers" name="Trailer" assetTypes={["trailer"]}/>
          <Titles storeKey="titles" header="Titles" name="Title" assetTypes={["primary"]}/>
          <Images />
          <Gallery />
          <Playlists />
        </div>
      </div>
    );
  }
}

export default AssetForm;
