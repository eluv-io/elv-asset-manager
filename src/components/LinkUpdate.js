import React from "react";
import {Action, BallSpin, Modal} from "elv-components-js";
import {inject, observer} from "mobx-react";
import AsyncComponent from "./AsyncComponent";

@inject("rootStore")
@observer
class LinkUpdate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      confirmed: false
    };

    this.ModalContent = this.ModalContent.bind(this);
  }

  CloseButton(text) {
    return (
      <Action
        className="secondary"
        onClick={() => this.setState({confirmed: false, showModal: false})}
      >
        { text || "Close" }
      </Action>
    );
  }

  UpdateStatus() {
    const updateStatus = this.props.rootStore.updateStatus || {};

    let progress, percentage;
    if(updateStatus.total) {
      progress = `(${updateStatus.completed}/${updateStatus.total})`;
      percentage = `${((updateStatus.completed || 0) * 100 / updateStatus.total).toFixed(1)}%`;
    }

    let reloadButton;
    if(!this.props.rootStore.updating) {
      reloadButton = (
        <Action
          className="update-status-reload-button"
          onClick={() => this.props.rootStore.client.SendMessage({options: {operation: "Reload"}})}
        >
          Reload
        </Action>
      );
    }

    let status, errorMessage;
    if(updateStatus.error) {
      errorMessage = (
        <div className="update-status-error-message">
          { updateStatus.error }
        </div>
      );
    } else {
      status = (
        <div className="update-status">
          <span className="update-status-percentage">
            { percentage } {progress}
          </span>
          <span className="update-status-action">
            { updateStatus.action }
          </span>
        </div>
      );
    }

    return (
      <React.Fragment>
        <h1>
          Updating Links
          { this.props.rootStore.updating ? <BallSpin/> : null }
        </h1>
        { errorMessage }
        { status }
        { reloadButton }
      </React.Fragment>
    );
  }

  Confirm() {
    return (
      <div className="update-confirm">
        <div className="update-confirm-message">
          Are you sure you want to update the links in this object?
        </div>
        <div className="update-confirm-message">
          WARNING: Any unsaved changes you have made will be lost.
        </div>
        <div className="update-confirm-actions">
          { this.CloseButton("Cancel") }
          <Action
            onClick={() => {
              this.props.rootStore.UpdateLinks();

              this.setState({
                confirmed: true
              });
            }}
          >
            OK
          </Action>
        </div>
      </div>
    );
  }

  ModalContent() {
    const linkStatus = this.props.rootStore.linkStatus;

    if(linkStatus.error) {
      return (
        <div className="update-status-error-message">
          Error: { linkStatus.error }

          { this.CloseButton() }
        </div>
      );
    }

    if(!linkStatus.updatesAvailable) {
      return (
        <div className="update-status-message">
          No updates required

          { this.CloseButton() }
        </div>
      );
    }

    if(!this.state.confirmed) {
      return this.Confirm();
    }

    return this.UpdateStatus();
  }

  Modal() {
    if(!this.state.showModal) { return null; }

    return (
      <Modal
        className={"asset-form-update-modal"}
        closable={false}
      >
        <AsyncComponent
          Load={this.props.rootStore.LinkStatus}
          render={this.ModalContent}
        />
      </Modal>
    );
  }

  render() {
    return (
      <React.Fragment>
        { this.Modal() }
        <Action
          className="asset-form-update-button secondary"
          onClick={() => this.setState({showModal: true})}
        >
          Update Links
        </Action>
      </React.Fragment>
    );
  }
}

export default LinkUpdate;
