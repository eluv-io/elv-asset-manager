import React from "react";
import {Action, BallSpin, Confirm, Modal} from "elv-components-js";
import {inject, observer} from "mobx-react";

@inject("rootStore")
@observer
class UpdateStatusModal extends React.Component {
  render() {
    const updateStatus = this.props.rootStore.updateStatus || {};
    const percentage = ((updateStatus.completed || 0) * 100 / (updateStatus.total || 1)).toFixed(1);

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
            { percentage }%
          </span>
          <span className="update-status-action">
            { updateStatus.action }
          </span>
        </div>
      );
    }

    return (
      <Modal
        className="asset-form-update-modal"
        closable={false}
      >
        <h1>
          Updating Links
          { this.props.rootStore.updating ? <BallSpin/> : null }
        </h1>
        { errorMessage }
        { status }
        { reloadButton }
      </Modal>
    );
  }
}

@inject("rootStore")
@observer
class LinkUpdate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  render() {
    return (
      <React.Fragment>
        { this.state.showModal ? <UpdateStatusModal /> : null }
        <Action
          className="asset-form-update-button secondary"
          onClick={async () => {
            await Confirm({
              message: (
                <React.Fragment>
                  <span className="update-confirm-message">
                    Are you sure you want to update the links in this object?
                  </span>
                  <br />
                  <span className="update-confirm-message">
                    WARNING: Any unsaved changes you have made will be lost.
                  </span>
                </React.Fragment>
              ),
              onConfirm: () => {
                this.setState({
                  showModal: true
                });

                this.props.rootStore.UpdateLinks();
              }
            });
          }}>
          Update Links
        </Action>
      </React.Fragment>
    );
  }
}

export default LinkUpdate;
