import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, FormatName, IconButton, Maybe, Tabs} from "elv-components-js";
import Clips from "./Clips";
import Images from "./Images";
import AssetInfo from "./AssetInfo";
import Playlists from "./Playlists";
import Credits from "./Credits";
import LinkUpdate from "./LinkUpdate";
import LiveStream from "./channels/LiveStream";
import Channel from "./channels/Channel";
import VoDChannel from "./vod_channels/VoDChannel";
import SiteAccessCode from "./SiteAccessCode";
import SiteCustomization from "./SiteCustomization";
import FileControl from "./FileControl";

import LocalizationIcon from "../static/icons/world.svg";
import CloseIcon from "../static/icons/x-circle.svg";
import SettingsIcon from "../static/icons/settings.svg";
import Searchables from "./Searchables";

@inject("rootStore")
@inject("formStore")
@observer
class LocalizationSelection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(!this.props.formStore.localization) { return null; }

    let firstSelection, secondSelection, thirdSelection;

    firstSelection = (
      <select
        value={this.props.formStore.currentLocalization[0]}
        onChange={event => {
          const options = event.target.value === "localizations" && this.props.formStore.assetInfo.localizations ?
            this.props.formStore.assetInfo.localizations :
            this.props.formStore.localization[event.target.value];
          const secondOption = options ? (Array.isArray(options) ? options[0] : Object.keys(options)[0]) : undefined;
          const thirdOption = secondOption && !Array.isArray(options) ? options[secondOption][0] : undefined;
          this.props.formStore.SetCurrentLocalization([
            event.target.value,
            secondOption,
            thirdOption || ""
          ]);
        }}
      >
        {
          [
            <option value="" key="localization-selection-none">None</option>,
            ...(Object.keys(this.props.formStore.localization).map(key =>
              <option key={`localization-selection-${key}`} value={key}>{ key }</option>
            ))
          ]
        }
      </select>
    );

    if(this.props.formStore.currentLocalization[0]) {
      const options = this.props.formStore.localization[this.props.formStore.currentLocalization[0]];
      secondSelection = (
        <select
          value={this.props.formStore.currentLocalization[1]}
          onChange={event => {
            const thirdOption = Array.isArray(options) ? undefined : options[event.target.value][0];
            this.props.formStore.SetCurrentLocalization([
              this.props.formStore.currentLocalization[0],
              event.target.value,
              thirdOption || ""
            ]);
          }}
        >
          {
            (Array.isArray(options) ? options : Object.keys(options)).map(key =>
              <option key={`localization-selection-${key}`} value={key}>{ key }</option>
            )
          }
        </select>
      );
    }

    if(this.props.formStore.currentLocalization[1] && this.props.formStore.currentLocalization[2]) {
      thirdSelection = (
        <select
          value={this.props.formStore.currentLocalization[2]}
          onChange={event => this.props.formStore.SetCurrentLocalization([this.props.formStore.currentLocalization[0], this.props.formStore.currentLocalization[1], event.target.value])}
        >
          {
            this.props.formStore.localization[this.props.formStore.currentLocalization[0]][this.props.formStore.currentLocalization[1]].map(key =>
              <option key={`localization-selection-${key}`} value={key}>{ key }</option>
            )
          }
        </select>
      );
    }

    return (
      <div className="sticky localization-selection-container">
        <IconButton
          className={`localization-icon ${this.props.formStore.localizationActive ? "active" : ""}`}
          icon={LocalizationIcon}
          onClick={this.props.Close}
        />
        <label>Select Localization to Manage:</label>
        { firstSelection }
        { secondSelection }
        { thirdSelection }
        {
          Maybe(
            this.props.formStore.localizationActive,
            <Action
              className="secondary clear-localization"
              onClick={() => this.props.formStore.ClearCurrentLocalization()}
            >
              Clear
            </Action>
          )
        }
        <IconButton
          title="Close localization selection"
          icon={CloseIcon}
          className="close-icon"
          onClick={this.props.Close}
        />
      </div>
    );
  }
}

@inject("rootStore")
@inject("formStore")
@observer
class AssetForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: "INFO",
      commitMessage: "",
      showLocalizationOptions: false
    };
  }

  Tabs() {
    let tabs = [];

    if(this.props.formStore.HasControl("channel")) {
      tabs.push(["Channel", "CHANNEL"]);
    }

    if(this.props.formStore.HasControl("vod_channel")) {
      tabs.push(["Channel", "VOD_CHANNEL"]);
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
      tabs.push([label || FormatName(name), name]);
    });

    if(!this.props.formStore.hideImageTab) {
      tabs.push(["Images", "IMAGES"]);
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

    if(this.props.formStore.localizationActive) {
      this.props.formStore.localizableFileControls.forEach(control => tabs.push([control.name, control.name]));
    } else {
      this.props.formStore.fileControls.forEach(control => tabs.push([control.name, control.name]));
    }

    tabs.push(["Searchables", "SEARCHABLES"]);

    return tabs;
  }

  CurentForm() {
    switch (this.state.form) {
      case "CHANNEL":
        return <Channel />;
      case "VOD_CHANNEL":
        return <VoDChannel />;
      case "LIVE":
        return <LiveStream />;
      case "INFO":
        return <AssetInfo />;
      case "CREDITS":
        return <Credits />;
      case "IMAGES":
        return <Images />;
      case "PLAYLISTS":
        return <Playlists />;
      case "SITE_CUSTOMIZATION":
        return <SiteCustomization />;
      case "SITE_CODES":
        return <SiteAccessCode />;
      case "SEARCHABLES":
        return <Searchables />;
      default:
        const control = this.props.formStore.fileControls
          .find(control => control.name === this.state.form);

        if(control) {
          // If localization is active and currently on non-localizable file control tab, return asset info
          if(this.props.formStore.localizationActive) {
            const localizedControl = this.props.formStore.localizableFileControls
              .find(control => control.name === this.state.form);

            if(!localizedControl) {
              return <AssetInfo />;
            }
          }

          return <FileControl control={control} />;
        }
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
        header={assetType.label || FormatName(assetType.name)}
        name={assetType.label || FormatName(assetType.name)}
        assetTypes={assetType.asset_types}
        titleTypes={assetType.title_types}
        defaultable={(assetType.indexed || assetType.slugged) && assetType.defaultable}
        orderable={assetType.orderable}
      />
    );
  }

  render() {
    const tabs = this.Tabs();
    return (
      <div className="asset-form">
        <div className="sticky app-header">
          <IconButton
            title={`Configure app settings ${!this.props.rootStore.canEditType ? "(you do not have permission to edit the content type)" : ""}`}
            disabled={!this.props.rootStore.canEditType}
            className="settings-icon"
            icon={SettingsIcon}
            onClick={() => this.props.rootStore.SetEditingConfiguration(true)}
          />
          {
            Maybe(
              this.props.formStore.localization && Object.keys(this.props.formStore.localization).length > 0,
              <IconButton
                className={`localization-icon ${this.props.formStore.localizationActive ? "active" : ""}`}
                title="Select localization"
                icon={LocalizationIcon}
                onClick={() => this.setState({showLocalizationOptions: !this.state.showLocalizationOptions})}
              />
            )
          }
          <LinkUpdate />
          <h1>
            Managing '{this.props.formStore.assetInfo.title || this.props.rootStore.assetName}'
            {
              Maybe(
                this.props.formStore.currentLocalization[1],
                <div className="localization-hint">{this.props.formStore.currentLocalization.filter(l => l).join("/")}</div>
              )
            }
          </h1>
          <Action
            className="asset-form-save-button"
            onClick={async () => {
              await Confirm({
                message: "Are you sure you want to save your changes?",
                additionalInputs: [{
                  label: "Commit Message (optional)",
                  name: "commitMessage",
                  onChange: commitMessage => this.setState({commitMessage})
                }],
                onConfirm: async () => {
                  await this.props.formStore.SaveAsset(true, this.state.commitMessage);
                  this.setState({commitMessage: ""});
                }
              });
            }}
          >
            Save
          </Action>
        </div>
        {
          Maybe(
            this.state.showLocalizationOptions,
            <LocalizationSelection Close={() => this.setState({showLocalizationOptions: false})} />
          )
        }
        {
          Maybe(
            tabs.length > 1,
            <Tabs
              className="asset-form-page-selection"
              selected={this.state.form}
              onChange={form => this.setState({form})}
              options={tabs}
            />
          )
        }
        <div className="asset-form-container">
          { this.CurentForm() }
        </div>
      </div>
    );
  }
}

export default AssetForm;
