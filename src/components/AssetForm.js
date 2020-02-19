import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, Tabs} from "elv-components-js";
import Clips from "./Clips";
import Images from "./Images";
import AssetInfo from "./AssetInfo";
import Gallery from "./Gallery";
import Playlists from "./Playlists";
import Credits from "./Credits";

const FORMS = [
  ["Info", "INFO"],
  ["Credits", "CREDITS"],
  //["Seasons", "SEASONS"] -- only present for title_type=series
  ["Clips", "CLIPS"],
  ["Trailers", "TRAILERS"],
  ["Titles", "TITLES"],
  ["Images", "IMAGES"],
  ["Gallery", "GALLERY"],
  ["Playlists", "PLAYLISTS"]
];

@inject("rootStore")
@inject("formStore")
@observer
class AssetForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: "INFO"
    };
  }

  Tabs() {
    // Inject "seasons" before clips if title is a series
    let forms = [...FORMS];
    if(this.props.formStore.assetInfo.title_type === "series") {
      const insertIndex = forms.findIndex(form => form[0] === "Clips");
      forms.splice(insertIndex, 0, ["Seasons", "SEASONS"]);
    }

    return forms;
  }

  CurentForm() {
    switch (this.state.form) {
      case "INFO":
        return <AssetInfo />;
      case "CREDITS":
        return <Credits />;
      case "SEASONS":
        return <Clips storeKey="seasons" header="Seasons" name="Season" titleTypes={["season"]} orderable />;
      case "CLIPS":
        return <Clips storeKey="clips" header="Clips" name="Clip" assetTypes={["trailer", "clip"]} defaultable orderable />;
      case "TRAILERS":
        return <Clips storeKey="trailers" header="Trailers" name="Trailer" assetTypes={["trailer", "clip"]} defaultable orderable />;
      case "TITLES":
        return <Clips storeKey="titles" header="Titles" name="Title" titleTypes={["feature", "episode", "series", "season", "franchise"]} assetTypes={["primary"]} orderable />;
      case "IMAGES":
        return <Images />;
      case "GALLERY":
        return <Gallery />;
      case "PLAYLISTS":
        return <Playlists />;
    }
  }

  render() {
    return (
      <div className="asset-form">
        <div className="sticky">
          <h1>Managing '{this.props.formStore.assetInfo.title || this.props.rootStore.assetName}'</h1>
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
        </div>
        <Tabs
          className="asset-form-page-selection"
          selected={this.state.form}
          onChange={form => this.setState({form})}
          options={this.Tabs()}
        />
        <div className="asset-form-container">
          { this.CurentForm() }
        </div>
      </div>
    );
  }
}

export default AssetForm;
