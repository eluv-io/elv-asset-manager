import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, Tabs} from "elv-components-js";
import Clips from "./Clips";
import Images from "./Images";
import AssetInfo from "./AssetInfo";
import Gallery from "./Gallery";
import Playlists from "./Playlists";
import Credits from "./Credits";
import LinkUpdate from "./LinkUpdate";
import LiveStream from "./LiveStream";

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
    let tabs = [];
    if(this.props.formStore.isLiveStream) {
      tabs.push(["Live Stream", "LIVE"]);
    }

    tabs.push(["Info", "INFO"]);
    tabs.push(["Credits", "CREDITS"]);

    // Inject relevant assets
    this.props.formStore.assetTypes.forEach(({label, for_title_types, name}) => {
      if(
        for_title_types &&
        for_title_types.length > 0 &&
        !for_title_types.includes(this.props.formStore.assetInfo.title_type)
      ) {
        return;
      }

      tabs.push([label, name]);
    });

    return tabs.concat([
      ["Images", "IMAGES"],
      ["Gallery", "GALLERY"],
      ["Playlists", "PLAYLISTS"]
    ]);
  }

  CurentForm() {
    switch (this.state.form) {
      case "LIVE":
        return <LiveStream />;
      case "INFO":
        return <AssetInfo />;
      case "CREDITS":
        return <Credits />;
      case "IMAGES":
        return <Images />;
      case "GALLERY":
        return <Gallery />;
      case "PLAYLISTS":
        return <Playlists />;
    }

    const assetType = this.props.formStore.assetTypes.find(({name}) => name === this.state.form);

    if(!assetType) {
      // eslint-disable-next-line no-console
      console.error("Unknown asset type:", this.state.form);
      return;
    }

    return (
      <Clips
        storeKey={assetType.name}
        header={assetType.label}
        name={assetType.label}
        assetTypes={assetType.asset_types}
        titleTypes={assetType.title_types}
        defaultable={(assetType.indexed || assetType.slugged) && assetType.defaultable}
        orderable={assetType.orderable}
      />
    );
  }

  render() {
    return (
      <div className="asset-form">
        <div className="sticky">
          <LinkUpdate />

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
