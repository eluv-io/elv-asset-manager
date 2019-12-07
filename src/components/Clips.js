import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton, Modal, Confirm} from "elv-components-js";
import PropTypes from "prop-types";
import ContentBrowser from "./ContentBrowser";
import VideoPreview from "./VideoPreview";

import RemoveIcon from "../static/icons/trash.svg";
import PlayIcon from "../static/icons/play-circle.svg";

const OrderButtons = ({index, length, Swap}) => {
  let upButton = <div className="placeholder" />;
  if(index > 0) {
    upButton = (
      <button
        title={"Move up"}
        onClick={() => Swap(index, index - 1)}
        className="order-button"
      >
        ▲
      </button>
    );
  }

  let downButton = <div className="placeholder" />;
  if(index < length - 1) {
    downButton = (
      <button
        title={"Move down"}
        onClick={() => Swap(index, index + 1)}
        className="order-button"
      >
        ▼
      </button>
    );
  }

  return (
    <div className="order-buttons-container">
      {upButton}
      {downButton}
    </div>
  );
};

const Clip = ({index, clip, name, length, Swap, Remove}) => {
  const {versionHash, title, id} = clip;

  const [showPreview, setShowPreview] = useState(false);

  const preview = showPreview ? <VideoPreview versionHash={versionHash}/> : null;

  return (
    <React.Fragment>
      <div key={`clip-${versionHash}-${index}`} className={`asset-form-clip ${showPreview ? "asset-form-clip-with-preview" : ""}`}>
        <IconButton
          icon={PlayIcon}
          title={`Preview ${title}`}
          className={`video-preview-icon ${showPreview ? "video-preview-icon-playing" : ""}`}
          onClick={() => setShowPreview(!showPreview)}
        />
        <div>{title} {id ? `(${id})` : ""}</div>
        <div className="clip-target-hash">{versionHash}</div>
        <OrderButtons index={index} length={length} Swap={Swap}/>
        <IconButton
          icon={RemoveIcon}
          className="remove-button"
          label={`Remove ${title}`}
          onClick={async () => {
            await Confirm({
              message: `Are you sure you want to remove the ${name} '${title}'?`,
              onConfirm: Remove
            });
          }}
        />
      </div>
      { preview }
    </React.Fragment>
  );
};

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
  }

  AddClip({versionHash}) {
    this.props.formStore.AddClip({key: this.props.storeKey, versionHash});
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
            header="Clip Selection"
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

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>{this.props.header}</h3>
        <div className="asset-form-clips-container">
          {this.props.formStore[this.props.storeKey].map((clip, i) =>
            <Clip
              index={i}
              clip={clip}
              length={this.props.formStore[this.props.storeKey].length}
              Swap={(i1, i2) => this.props.formStore.SwapClip({key: this.props.storeKey, i1, i2})}
              Remove={() => this.props.formStore.RemoveClip({key: this.props.storeKey, index})}
            />
          )}
        </div>
        <Action onClick={this.ActivateModal}>
          Add {this.props.name}
        </Action>
        { this.state.modal }
      </div>
    );
  }
}

Clips.propTypes = {
  storeKey: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  assetTypes: PropTypes.arrayOf(PropTypes.string)
};

export default Clips;
