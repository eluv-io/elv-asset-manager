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
import LiveStream from "./channels/LiveStream";
import Channel from "./channels/Channel";
import SiteAccessCode from "./SiteAccessCode";
import SiteCustomization from "./SiteCustomization";

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

    if(this.props.formStore.HasControl("channel")) {
      tabs.push(["Channel", "CHANNEL"]);
    }

    if(this.props.formStore.HasControl("live_stream")) {
      tabs.push(["Live Stream", "LIVE"]);
    }

    tabs.push(["Info", "INFO"]);

    if(this.props.formStore.HasControl("credits")) {
      tabs.push(["Credits", "CREDITS"]);
    }

    // Inject relevant assets
    this.props.formStore.relevantAssociatedAssets.forEach(({label, name}) => {
      tabs.push([label, name]);
    });

    tabs.push(["Images", "IMAGES"]);

    if(this.props.formStore.HasControl("gallery")) {
      tabs.push(["Gallery", "GALLERY"]);
    }

    if(this.props.formStore.HasControl("playlists")) {
      tabs.push(["Playlists", "PLAYLISTS"]);
    }

    if(this.props.formStore.HasControl("site_customization")) {
      tabs.push(["Site Customization", "SITE_CUSTOMIZATION"]);
    }

    if(this.props.formStore.HasControl("site_codes")) {
      tabs.push(["Access Codes", "SITE_CODES"]);
    }

    return tabs;
  }

  CurentForm() {
    switch (this.state.form) {
      case "CHANNEL":
        return <Channel />;
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
      case "SITE_CUSTOMIZATION":
        return <SiteCustomization />;
      case "SITE_CODES":
        return <SiteAccessCode />;
    }

    const assetType = this.props.formStore.associatedAssets.find(({name}) => name === this.state.form);

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
