import React from "react";
import {inject, observer} from "mobx-react";
import AppFrame from "./AppFrame";
import UrlJoin from "url-join";
import {Action, Confirm, IconButton} from "elv-components-js";
import {ColorSelection, FormatName, Maybe} from "./Inputs";
import FileSelection from "./FileBrowser";
import {PreviewImage} from "./PreviewIcon";
import AsyncComponent from "./AsyncComponent";

import DeleteIcon from "../static/icons/trash.svg";
import MaximizeIcon from "../static/icons/maximize.svg";
import OrderButtons from "./OrderButtons";
import Premiere from "./Premiere";

const siteComponents = {
  feature: {
    options: {
      variant: {
        label: "Variant",
        values: ["hero", "box", "video"]
      }
    }
  },
  carousel: {
    options: {
      width: {
        label: "Icon Width",
        values: ["small", "medium", "large"]
      },
      variant: {
        label: "Variant",
        values: ["landscape", "portrait"]
      }
    }
  },
  grid: {
    options: {
      width: {
        label: "Icon Width",
        values: ["small", "medium", "large"]
      },
      variant: {
        label: "Variant",
        values: ["landscape", "portrait"]
      }
    }
  },
  header: {
    for: ["header"],
    className: "long",
    options: {
      text: {
        label: "Text"
      }
    }
  }
};

@inject("formStore")
@observer
class SiteArrangementEntry extends React.Component {
  // source type, component, variant, options (e.g. carousel/grid width)

  Entry() {
    return this.props.formStore.siteCustomization.arrangement[this.props.index];
  }

  Update(attrs) {
    this.props.formStore.UpdateArrangementEntry({
      index: this.props.index,
      attrs: {
        ...this.Entry(),
        ...attrs
      }
    });
  }

  Actions() {
    return (
      <div className="arrangement-option actions-cell">
        <label />
        <div className="actions">
          <OrderButtons
            index={this.props.index}
            length={this.props.formStore.siteCustomization.arrangement.length}
            Swap={this.props.formStore.SwapArrangementEntries}
          />
          <IconButton
            icon={DeleteIcon}
            onClick={() => this.props.formStore.RemoveArrangementEntry(this.props.index)}
          />
        </div>
      </div>
    );
  }

  Options() {
    const entry = this.Entry();

    const component = siteComponents[entry.component] || {};
    const options = component.options || {};

    return Object.keys(options).map(key => {
      const config = options[key];

      let input;
      if(config.values) {
        input = (
          <select
            value={entry.options[key]}
            onChange={event => this.Update({options: {...entry.options, [key]: event.target.value}})}
          >
            {
              config.values.map(value =>
                <option key={`option-value-${value}`} value={value}>{ FormatName(value) }</option>
              )
            }
          </select>
        );
      } else {
        input = <input value={entry.options[key]} onChange={event => this.Update({options: {...entry.options, [key]: event.target.value}})} />;
      }

      return (
        <div className={`arrangement-option ${component.className || ""}`} key={`arrangement-option-${key}`}>
          <label>{ config.label }</label>
          { input }
        </div>
      );
    });
  }

  Label() {
    if(!["asset", "playlist"].includes(this.Entry().type)) {
      return null;
    }

    return (
      <div className="arrangement-option">
        <label>Label</label>
        <input
          value={this.Entry().label}
          onChange={event => this.Update({label: event.target.value})}
        />
      </div>
    );
  }

  Components() {
    if(!["asset", "playlist"].includes(this.Entry().type)) {
      return null;
    }

    return (
      <div className="arrangement-option">
        <label>Component</label>
        <select
          value={this.Entry().component}
          onChange={event => this.Update({component: event.target.value})}
        >
          {
            Object.keys(siteComponents).map(component =>
              component === "header" ? null : <option key={`component-${component}`} value={component}>{ FormatName(component) }</option>
            )
          }
        </select>
      </div>
    );
  }

  Sources() {
    let assets = this.props.formStore.relevantAssociatedAssets.map(assetType => [assetType.label, assetType.name]);

    if(this.props.formStore.controls.includes("playlists") && this.props.formStore.playlists.length > 0) {
      assets = assets.concat(
        this.props.formStore.playlists.map(playlist => [`${playlist.playlistName} (Playlist)`, `playlist--${playlist.playlistId}`])
      );
    }

    let labelMap = {};
    assets.forEach(([label, name]) => labelMap[name] = label.replace(/ \(Playlist\)$/, ""));

    assets.push(["Header", "header"]);

    return (
      <div className="arrangement-option medium">
        <label>Entry</label>
        <select
          value={this.Entry().name}
          onChange={event => {
            const source = event.target.value;
            const label = labelMap[source];
            if(source.startsWith("playlist--")) {
              this.Update({
                type: "playlist",
                name: source,
                label,
                playlistId: source.split("playlist--")[1]
              });
            } else if(source === "header") {
              this.Update({
                type: "header",
                name: "header",
                component: "header",
                playlistId: undefined,
                options: {
                  ...(this.Entry().options),
                  text: ""
                }
              });
            } else {
              this.Update({
                type: "asset",
                name: source,
                label,
                playlistId: undefined
              });
            }
          }}
        >
          { assets.map(([label, name]) => <option key={`asset-source-${name}`} value={name}>{label}</option> )}
        </select>
      </div>
    );
  }

  render() {
    return (
      <div className="site-arrangement-entry">
        { this.Sources() }
        { this.Label() }
        { this.Components() }
        { this.Options() }
        { this.Actions() }
      </div>
    );
  }
}



@inject("rootStore")
@inject("formStore")
@observer
class SiteCustomization extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: {},
      version: 1,
      showPreview: false
    };

    this.ToggleFullscreen = this.ToggleFullscreen.bind(this);
  }

  ToggleFullscreen() {
    // if already full screen; exit
    // else go fullscreen
    if(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if(document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const element = this.previewFrame && this.previewFrame.children && this.previewFrame.children[0];

      if(!element) { return; }

      if(element.requestFullscreen) {
        element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  }

  Preview() {
    if(!this.state.showPreview) {
      return (
        <div className="preview-frame-container">
          <div className="actions-container">
            <Action onClick={() => this.setState({showPreview: true})}>
              Show Preview
            </Action>
          </div>
        </div>
      );
    }

    return (
      <div className="preview-frame-container">
        <div className="actions-container">
          <Action className="secondary" onClick={() => this.setState({showPreview: false})}>
            Hide Preview
          </Action>
          <Action onClick={() => this.setState({version: this.state.version + 1})}>
            Update Preview
          </Action>
          <IconButton
            className="preview-fullscreen-button"
            icon={MaximizeIcon}
            title="Remove this entry"
            onClick={this.ToggleFullscreen}
          />
        </div>
        <div
          ref={previewFrame => this.previewFrame = previewFrame}
          className="app-frame-container"
        >
          <AsyncComponent
            key={`app-frame-${this.state.version}`}
            Load={async () => {
              if(this.state.version > 1) {
                await this.props.formStore.SaveAsset(false);
              }
            }}
            render={() =>
              <AppFrame
                appUrl={
                  UrlJoin(
                    EluvioConfiguration.apps["Site Sample"],
                    "/#/preview",
                    this.props.rootStore.params.objectId,
                    this.props.formStore.editWriteToken || ""
                  )}
                className="site-preview-frame"
              />
            }
          />
        </div>
      </div>
    );
  }

  Logo() {
    const logoLink = this.props.formStore.siteCustomization.logo;

    return (
      <div className="site-logo-selection">
        <h4>Logo</h4>
        {Maybe(
          logoLink,
          () => <PreviewImage imagePath={logoLink.imagePath} targetHash={logoLink.targetHash} />
        )}
        <FileSelection
          header="Select a Logo"
          useButton={true}
          buttonText="Select a Logo"
          versionHash={(logoLink && logoLink["."] && logoLink["."].source) || this.props.rootStore.params.versionHash}
          Select={({imagePath, targetHash}) => this.props.formStore.UpdateSiteLogo({
            imagePath,
            targetHash
          })}
        />
      </div>
    );
  }

  Colors() {
    const colors = this.props.formStore.siteCustomization.colors;

    return (
      <div className="site-color-selection">
        <h4>Colors</h4>
        { Object.keys(colors).map(key =>
          <ColorSelection
            key={`color-selection-${key}`}
            name={key}
            value={colors[key]}
            onChange={color => this.props.formStore.UpdateSiteColor({colorKey: key, color})}
          />
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-container site-customization">
        <h3>Customize Site</h3>
        <div className="asset-form-section-container site-color-logo">
          { this.Logo() }
          { this.Colors() }
        </div>
        <Premiere />
        <div className="asset-form-section-container site-arrangement-container">
          <h4>Arrangement</h4>
          { this.props.formStore.siteCustomization.arrangement.map((_, i) => <SiteArrangementEntry key={`site-entry-${i}`} index={i} />)}
          <div className="actions-container">
            <Action
              className="secondary"
              onClick={async () =>
                await Confirm({
                  message: "Are you sure you want to use the default arrangement?",
                  onConfirm: this.props.formStore.DefaultArrangement
                })
              }
            >
              Default
            </Action>
            <Action onClick={this.props.formStore.AddArrangementEntry}>Add</Action>
          </div>
        </div>
        { this.Preview() }
      </div>
    );
  }
}

export default SiteCustomization;
