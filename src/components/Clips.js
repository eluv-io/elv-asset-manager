import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton, Modal, Confirm} from "elv-components-js";
import PropTypes from "prop-types";
import ContentBrowser from "./ContentBrowser";
import VideoPreview from "./VideoPreview";
import OrderButtons from "./OrderButtons";

import UpdateIcon from "../static/icons/arrow-up-circle.svg";
import RemoveIcon from "../static/icons/trash.svg";
import PlayIcon from "../static/icons/play-circle.svg";
import LinkIcon from "../static/icons/external-link.svg";
import KeyIcon from "../static/icons/key.svg";
import LockIcon from "../static/icons/lock.svg";
import {InitPSF} from "./Misc";

export const Clip = ({
  index,
  isDefault,
  isPlayable,
  clip,
  name,
  length,
  defaultable,
  orderable,
  Swap,
  Remove,
  Update,
  SetDefault,
  OpenObjectLink,
  SignLink
}) => {
  const {versionHash, title, id, slug, assetType, latestVersionHash, originalLink} = clip;

  const [showPreview, setShowPreview] = useState(false);

  const preview = showPreview ? <VideoPreview versionHash={versionHash}/> : null;

  const linkButton = (
    <IconButton
      className="open-object-link"
      icon={LinkIcon}
      label="Open object in new tab"
      onClick={() => OpenObjectLink({versionHash})}
    />
  );

  let defaultButton;
  if(defaultable) {
    defaultButton = (
      <Action
        type="button"
        label="default"
        additionalProps={{
          role: "checkbox",
          "aria-checked": isDefault
        }}
        title={isDefault ? "Remove default" : "Make default"}
        className={`checkbox-button ${isDefault ? "checked" : ""}`}
        onClick={() => SetDefault(index)}
      >
        Default
      </Action>
    );
  }

  let orderButtons;
  if(orderable) {
    orderButtons = <OrderButtons index={index} length={length} Swap={Swap}/>;
  }

  let updateButton;
  if(versionHash !== latestVersionHash) {
    updateButton = (
      <IconButton
        icon={UpdateIcon}
        className="update-button"
        label={`Update ${title} to the latest version`}
        onClick={async () => {
          await Confirm({
            message: `Are you sure you want to update ${name ? `the ${name}` : ""} '${title || id}'?`,
            onConfirm: Update
          });
        }}
      />
    );
  }

  let signButton;
  if(originalLink) {
    const authorizedLink = originalLink["."].hasOwnProperty("authorization");

    signButton = (
      <IconButton
        icon={authorizedLink ? LockIcon : KeyIcon}
        title={authorizedLink ? "Unsign link" : "Sign link"}
        onClick={async () => {
          await Confirm({
            message: `Are you sure you want to ${authorizedLink ? "unsign" : "sign"} the link for ${name ? name : ""} '${title}'?`,
            onConfirm: () => SignLink({sign: !authorizedLink})
          });
        }}
      />
    );
  }

  const TitleText = () => {
    if(title) {
      return <div title={title}>{title} {id ? `(${id})` : ""}</div>;
    } else {
      return <div title={id}>{id || ""}</div>;
    }
  };

  return (
    <React.Fragment>
      <div
        key={`clip-${versionHash}-${index}`}
        className={`
          asset-form-clip 
          ${index % 2 === 0 ? "even" : "odd"}
          ${orderable   ? "asset-form-clip-orderable" : ""}
          ${defaultable ? "asset-form-clip-defaultable" : ""}
          ${showPreview ? "asset-form-clip-with-preview" : ""}
        `}
      >
        <IconButton
          icon={PlayIcon}
          title={`Preview ${title}`}
          className={`
            video-preview-icon
            ${isPlayable ? "" : "video-preview-icon-not-playable"}
            ${showPreview ? "video-preview-icon-playing" : ""}
          `}
          onClick={() => isPlayable ? setShowPreview(!showPreview) : ""}
        />
        <div className="hint">{assetType}</div>
        {TitleText()}
        <div className="clip-slug-hash" title={`${slug || ""} ${versionHash}`}>{slug || versionHash}</div>
        { defaultButton }
        { orderButtons }
        <div className="asset-form-clip-actions">
          { signButton }
          { updateButton }
          { linkButton }
          <IconButton
            icon={RemoveIcon}
            className="remove-button"
            label={`Remove ${title}`}
            onClick={async () => {
              await Confirm({
                message: `Are you sure you want to remove ${name ? `the ${name}` : ""} '${title || id}'?`,
                onConfirm: Remove
              });
            }}
          />
        </div>
      </div>
      { preview }
    </React.Fragment>
  );
};

@inject("rootStore")
@inject("formStore")
@observer
class Clips extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
      previews: {}
    };

    this.AddClip = this.AddClip.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);

    this.InitPSF = InitPSF.bind(this);
    this.InitPSF({
      sortKey: "displayTitle",
      perPage: 100,
      additionalState: {
        key: this.props.storeKey
      }
    });
  }

  AddClip({versionHash}) {
    this.props.formStore.AddClip({
      key: this.props.storeKey,
      playlistIndex: this.props.playlistIndex,
      versionHash
    });
    this.CloseModal();
  }

  ActivateModal() {
    this.setState({
      modal: (
        <Modal
          className="asset-form-modal"
          closable={true}
          OnClickOutside={this.CloseModal}
        >
          <ContentBrowser
            header={`Select ${this.props.name}`}
            titleTypes={this.props.titleTypes}
            assetTypes={this.props.assetTypes}
            onComplete={this.AddClip}
            onCancel={this.CloseModal}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  ClipsList() {
    let clips;
    if(this.props.playlistIndex !== undefined) {
      clips = this.props.formStore.currentLocalizedData.playlists[this.props.playlistIndex].clips;
    } else {
      clips = this.props.formStore.currentLocalizedData.assets[this.props.storeKey];
    }

    if(this.state.activeFilter) {
      clips = clips.filter(clip => {
        const searchTerms = ["assetType", "displayTitle", "slug", "title"];

        return searchTerms.some(term => (clip[term] || "").toLowerCase().includes(this.state.activeFilter));
      });
    }

    return clips;
  }

  render() {
    const clips = this.ClipsList();
    const startIndex = (this.state.page - 1) * this.state.perPage;

    return (
      <div className="asset-form-section-container">
        <h3>{this.props.header}</h3>
        <div className="controls">
          <Action onClick={this.ActivateModal}>
            Add {this.props.name}
          </Action>
          { this.Filter("Filter Titles...") }
        </div>
        { this.PageControls(clips.length) }
        <div className="asset-form-clips-container">
          {
            clips.length ? <div
              className={`
            asset-form-clip 
            ${this.props.orderable   ? "asset-form-clip-orderable" : ""}
            ${this.props.defaultable ? "asset-form-clip-defaultable" : ""}
            ${this.props.showPreview ? "asset-form-clip-with-preview" : ""}
          `}>
              <div></div>
              { this.SortableHeader("assetType", "Type", this.props.name) }
              { this.SortableHeader("displayTitle", "Title", this.props.name) }
              { this.SortableHeader("slug", "Slug", this.props.name) }
              { this.props.defaultable ? this.SortableHeader("isDefault", "Default", this.props.name) : null }
              <div></div>
              <div></div>
            </div> : null
          }
          {
            this.Paged(clips || []).map((clip, index) =>
              <Clip
                index={index}
                isPlayable={clip.playable}
                isDefault={clip.isDefault}
                defaultable={this.props.defaultable}
                orderable={this.props.orderable && !this.state.activeFilter}
                key={`asset-clip-${this.props.storeKey || this.props.playlistIndex}-${index}`}
                clip={clip}
                length={clips.length}
                Swap={(i1, i2) => this.props.formStore.SwapClip({
                  key: this.props.storeKey,
                  playlistIndex: this.props.playlistIndex,
                  i1: i1 + startIndex,
                  i2: i2 + startIndex
                })}
                SetDefault={index => this.props.formStore.SetDefaultClip({
                  key: this.props.storeKey,
                  playlistIndex: this.props.playlistIndex,
                  index
                })}
                Update={() => this.props.formStore.UpdateClip({
                  key: this.props.storeKey,
                  playlistIndex: this.props.playlistIndex,
                  index: this.props.formStore.ClipOriginalIndex({versionHash: clip.versionHash, key: this.props.storeKey})
                })}
                Remove={() => this.props.formStore.RemoveClip({
                  key: this.props.storeKey,
                  playlistIndex: this.props.playlistIndex,
                  index: this.props.formStore.ClipOriginalIndex({versionHash: clip.versionHash, key: this.props.storeKey})
                })}
                OpenObjectLink={this.props.rootStore.OpenObjectLink}
                SignLink={({sign}) => this.props.formStore.ToggleLinkAuth({
                  sign,
                  versionHash: clip.versionHash,
                  containerId: this.props.rootStore.params.objectId,
                  path: `public/asset_metadata/${this.props.storeKey}/${clip.isDefault ? "default" : index}/${clip.slug}`,
                  key: this.props.storeKey,
                  index
                })}
              />
            )
          }
        </div>
        { this.state.modal }
      </div>
    );
  }
}

Clips.propTypes = {
  storeKey: PropTypes.string,
  playlistIndex: PropTypes.number,
  header: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  assetTypes: PropTypes.arrayOf(PropTypes.string),
  titleTypes: PropTypes.arrayOf(PropTypes.string),
  defaultable: PropTypes.bool,
  orderable: PropTypes.bool
};

export default Clips;
