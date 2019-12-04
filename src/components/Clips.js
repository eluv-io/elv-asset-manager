import React from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton, Modal, Confirm} from "elv-components-js";
import PropTypes from "prop-types";
import ContentBrowser from "./ContentBrowser";
import RemoveIcon from "../static/icons/trash.svg";

@inject("formStore")
@observer
class Clips extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null
    };

    this.AddClip = this.AddClip.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
  }

  AddClip({versionHash}) {
    this.props.formStore.AddClip({key: this.props.storeKey, versionHash});
    this.CloseModal();
  }

  CloseModal() {
    this.setState({modal: null});
  }

  OrderButtons(index) {
    let upButton = <div className="placeholder" />;
    if(index > 0) {
      upButton = (
        <button
          title={"Move up"}
          onClick={() => this.props.formStore.SwapClip({key: this.props.storeKey, i1: index, i2: index - 1})}
          className="order-button"
        >
          ▲
        </button>
      );
    }

    let downButton = <div className="placeholder" />;
    if(index < this.props.formStore[this.props.storeKey].length - 1) {
      downButton = (
        <button
          title={"Move down"}
          onClick={() => this.props.formStore.SwapClip({key: this.props.storeKey, i1: index, i2: index + 1})}
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
  }

  Clip(clip, index) {
    const {versionHash, title, id} = clip;

    return (
      <div key={`clip-${versionHash}-${index}`} className="asset-form-clip">
        <span>{index + 1}</span>
        <span className="clip-title">{title} {id ? `(${id})` : ""}</span>
        { this.OrderButtons(index) }
        <IconButton
          icon={RemoveIcon}
          className="remove-button"
          label={`Remove ${title}`}
          onClick={async () => {
            await Confirm({
              message: `Are you sure you want to remove the ${this.props.name} '${title}'?`,
              onConfirm: () => this.props.formStore.RemoveClip({key: this.props.storeKey, index})
            });
          }}
        />
      </div>
    );
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

  render() {
    return (
      <div className="asset-form-container">
        <h3>{this.props.header}</h3>
        <div className="asset-form-clips-container">
          {this.props.formStore[this.props.storeKey].map((clip, i) => this.Clip(clip, i))}
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
