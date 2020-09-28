import React, {useState, useEffect} from "react";
import {inject, observer} from "mobx-react";
import AppFrame from "./AppFrame";
import UrlJoin from "url-join";
import {
  Action,
  Confirm,
  IconButton,
  Modal,
  ColorSelection,
  FormatName,
  Maybe,
  DateSelection, ToggleSection
} from "elv-components-js";
import FileSelection from "./FileBrowser";
import {PreviewImage} from "./PreviewIcon";
import AsyncComponent from "./AsyncComponent";

import DeleteIcon from "../static/icons/trash.svg";
import MaximizeIcon from "../static/icons/maximize.svg";
import OrderButtons from "./OrderButtons";
import Premiere from "./Premiere";
import ContentBrowser from "./ContentBrowser";
import {Clip} from "./Clips";

const siteComponents = {
  hero: {
    firstOnly: true,
    noLabel: true
  },
  feature: {
    singleTitle: true,
    noLabel: true,
    initialOptions: {
      variant: "box",
      color: "#6bb7ff"
    },
    options: {
      variant: {
        label: "Variant",
        values: ["box", "video"]
      },
      color: {
        label: "Color",
        type: "color",
        forVariant: "box",
      }
    }
  },
  carousel: {
    initialOptions: {
      variant: "landscape"
    },
    options: {
      variant: {
        label: "Variant",
        values: ["landscape", "portrait"]
      }
    }
  },
  grid: {
    initialOptions: {
      variant: "landscape"
    },
    options: {
      variant: {
        label: "Variant",
        values: ["landscape", "portrait"]
      }
    }
  },
  event: {
    singleTitle: true,
    noLabel: true,
    initialOptions: {
      title: "",
      description: "",
      date: undefined,
      price: "",
      featureImage: undefined,
      eventImage: undefined,
    },
    options: {
      title: {
        label: "Title",
        fullLine: true,
        type: "text"
      },
      description: {
        label: "Description",
        fullLine: true,
        type: "textarea"
      },
      date: {
        label: "Date",
        fullLine: true,
        type: "datetime"
      },
      price: {
        label: "Price",
        fullLine: true,
        type: "text",
        characterRegex: /[^0-9.]/g
      },
      featureImage: {
        label: "Feature Image",
        fullLine: true,
        type: "image"
      },
      eventImage: {
        label: "Event Image",
        fullLine: true,
        type: "image"
      }
    }
  },
  header: {
    noTitles: "true",
    noLabel: true,
    className: "long",
    initialOptions: {
      text: ""
    },
    options: {
      text: {
        label: "Text",
        type: "text"
      }
    }
  }
};

const ImageSelection = inject("rootStore")(observer(
  ({link, header, selectionHeader, Update, className="", rootStore}) => {
    useEffect(() => {
      if(link) { rootStore.contentStore.LoadBaseFileUrl(link.targetHash); }
    });

    return (
      <div className={`image-selection ${className}`}>
        {header ? <h4>{header}</h4> : null }
        {Maybe(
          link,
          () => <PreviewImage imagePath={link.imagePath} targetHash={link.targetHash}/>
        )}
        <FileSelection
          header={selectionHeader}
          useButton={true}
          buttonText={selectionHeader}
          versionHash={(link && link["."] && link["."].source) || rootStore.params.versionHash}
          Select={Update}
        />
      </div>
    );
  }
));

const TitleSelection = ({buttonText="Select a Title", selectionText="Select a Title", Update, className=""}) => {
  const [modal, setModal] = useState(null);

  const Browse = () => setModal(
    <Modal
      className="asset-form-modal"
      closable
      OnClickOutside={() => setModal(null)}
    >
      <ContentBrowser
        header={selectionText}
        onComplete={async args => {
          await Update(args);
          setModal(null);
        }}
        onCancel={() => setModal(null)}
      />
    </Modal>
  );

  return (
    <div className={`title-selection ${className}`}>
      <label />
      <Action onClick={Browse}>
        { buttonText }
      </Action>
      { modal }
    </div>
  );
};

@inject("formStore")
@inject("rootStore")
@observer
class SiteArrangementEntry extends React.Component {
  Entry() {
    return this.props.formStore.siteCustomization.arrangement[this.props.index];
  }

  SingleTitle() {
    const title = this.Entry().title;

    if(!title) { return null; }

    return (
      <div className="asset-form-clips-container">
        <Clip
          index={0}
          isPlayable={title.playable}
          clip={title}
          Remove={() => this.props.formStore.UpdateArrangementEntry({index: this.props.index, attrs: {...this.Entry(), title: undefined}})}
          OpenObjectLink={this.props.rootStore.OpenObjectLink}
        />
      </div>
    );
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
    let orderButtons;
    if(!siteComponents[this.Entry().component].firstOnly) {
      orderButtons = (
        <OrderButtons
          index={this.props.index}
          length={this.props.formStore.siteCustomization.arrangement.length}
          Swap={this.props.formStore.SwapArrangementEntries}
        />
      );
    }

    let titleSelection;
    if(siteComponents[this.Entry().component].singleTitle) {
      titleSelection = (
        <TitleSelection
          buttonText="Select a Title"
          selectionHeader="Select a Title"
          className="arrangement-option actions-cell"
          Update={({versionHash}) => this.props.formStore.SetArrangementEntryTitle(this.props.index, versionHash)}
        />
      );
    }

    return (
      <React.Fragment>
        { titleSelection }
        <div className="arrangement-option actions-cell">
          <label />
          <div className="actions">
            { orderButtons }
            <IconButton
              icon={DeleteIcon}
              onClick={() => this.props.formStore.RemoveArrangementEntry(this.props.index)}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

  Options(inline) {
    const entry = this.Entry();

    const component = siteComponents[entry.component] || {};
    let options = component.options || {};

    return Object.keys(options)
      .filter(key => inline ? !options[key].fullLine : options[key].fullLine)
      .map(key => {
        const config = options[key];

        if(config.forVariant && entry.options.variant !== config.forVariant) {
          return null;
        }

        let input;
        if(config.values) {
          input = (
            <select
              value={entry.options[key]}
              onChange={event => this.Update({options: {...entry.options, [key]: event.target.value}})}
            >
              {
                config.values.map(value =>
                  <option key={`option-value-${value}`} value={value}>{FormatName(value)}</option>
                )
              }
            </select>
          );
        } else if(config.type === "image") {
          input = (
            <div className="arrangement-option-image">
              <ImageSelection
                link={entry.options[key]}
                selectionHeader="Select an Image"
                Update={({targetHash, path, imagePath}) => {
                  this.Update({
                    options: {
                      ...entry.options,
                      [key]: {
                        targetHash,
                        imagePath,
                        path,
                        ...(
                          this.props.formStore.CreateLink(
                            targetHash,
                            UrlJoin("files", imagePath)
                          )
                        )
                      }
                    }
                  });
                }}
              />
            </div>
          );
        } else if(config.type === "date" || config.type === "datetime") {
          input = (
            <DateSelection
              noLabel
              value={entry.options[key]}
              dateOnly={config.type === "date"}
              onChange={date => this.Update({options: {...entry.options, [key]: date}})}
            />
          );
        } else if(config.type === "textarea") {
          input = (
            <textarea
              value={entry.options[key]}
              onChange={event => this.Update({options: {...entry.options, [key]: event.target.value}})}
            />
          );
        } else {
          input = (
            <input
              type={config.type}
              value={entry.options[key]}
              onChange={event => {
                let value = event.target.value;

                if(config.characterRegex) { value = value.replace(config.characterRegex, ""); }

                this.Update({options: {...entry.options, [key]: value}});
              }}
            />
          );
        }

        return (
          <div className={`arrangement-option ${component.className || ""} ${config.type === "color" ? "color-option" : ""}`} key={`arrangement-option-${key}`}>
            <label>{ config.label }</label>
            { input }
          </div>
        );
      })
      .filter(option => option);
  }

  Label() {
    if(
      !["asset", "playlist"].includes(this.Entry().type) ||
      siteComponents[this.Entry().component].noLabel
    ) {
      return null;
    }

    return (
      <div className="arrangement-option medium">
        <label>Label</label>
        <input
          value={this.Entry().label}
          onChange={event => this.Update({label: event.target.value})}
        />
      </div>
    );
  }

  Sources() {
    if(siteComponents[this.Entry().component].noTitles || siteComponents[this.Entry().component].singleTitle) { return null; }

    let assets = this.props.formStore.relevantAssociatedAssets.map(assetType => [assetType.label, assetType.name]);

    if(this.props.formStore.controls.includes("playlists") && this.props.formStore.playlists.length > 0) {
      assets = assets.concat(
        this.props.formStore.playlists.map(playlist => [`${playlist.playlistName} (Playlist)`, `playlist--${playlist.playlistId}`])
      );
    }

    let labelMap = {};
    assets.forEach(([label, name]) => labelMap[name] = label.replace(/ \(Playlist\)$/, ""));

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

  Components() {
    return (
      <div className="arrangement-option">
        <label>Component</label>
        <select
          value={this.Entry().component}
          onChange={event => {
            const componentSpec = siteComponents[event.target.value];
            this.Update({
              component: event.target.value,
              label: componentSpec.noLabel ? "" : this.Entry().label,
              name: componentSpec.singleTitle || componentSpec.noTitle ? "" : this.Entry().name,
              title: componentSpec.singleTitle ? this.Entry().title : undefined,
              options: componentSpec.initialOptions
            });
          }}
        >
          {
            Object.keys(siteComponents).map(component => {
              if(siteComponents[component].firstOnly && this.props.index !== 0) {
                return null;
              }

              return <option key={`component-${component}`} value={component}>{ FormatName(component) }</option>;
            })
          }
        </select>
      </div>
    );
  }

  Details() {
    const options = this.Options(false);

    if(!options || options.length === 0) { return null; }

    return (
      <ToggleSection sectionName="Details" showInitially>
        <div className="site-arrangement-full-line-entries">
          { options }
        </div>
      </ToggleSection>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="site-arrangement-entry">
          { this.Components() }
          { this.Sources() }
          { this.Label() }
          { this.Options(true) }
          { this.Actions() }
        </div>
        { this.SingleTitle() }
        { this.Details() }
      </React.Fragment>
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
    return (
      <ImageSelection
        link={this.props.formStore.siteCustomization.logo}
        header="Logo"
        selectionHeader="Select a Logo"
        Update={this.props.formStore.UpdateSiteLogo}
      />
    );
  }

  BackgroundImage() {
    return (
      <ImageSelection
        link={this.props.formStore.siteCustomization.background_image}
        header="Background Image"
        selectionHeader="Select an Image"
        Update={this.props.formStore.UpdateSiteBackgroundImage}
      />
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

  Arrangement() {
    const premiereInfo = this.props.formStore.siteCustomization.premiere || {};

    if(premiereInfo && premiereInfo.enabled) {
      // Hide arrangement if premiere is enabled
      return null;
    }

    return (
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
    );
  }

  render() {
    return (
      <div className="asset-form-container site-customization">
        <h3>Customize Site</h3>
        <div className="asset-form-section-container site-color-logo">
          { this.Logo() }
          { this.BackgroundImage() }
          { this.Colors() }
        </div>

        <Premiere />

        { this.Arrangement() }

        { this.Preview() }
      </div>
    );
  }
}

export default SiteCustomization;
