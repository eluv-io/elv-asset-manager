import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, IconButton, ImageIcon, Modal} from "elv-components-js";

import VideoPreview from "../VideoPreview";
import ContentBrowser from "../ContentBrowser";
import Schedule from "./Schedule";

import StreamActive from "../../static/icons/video.svg";
import StreamInactive from "../../static/icons/video-off.svg";
import LinkIcon from "../../static/icons/external-link.svg";

@inject("rootStore")
@inject("channelStore")
@observer
class StreamInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
      previewStream: false
    };

    this.SelectStream = this.SelectStream.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
  }

  StreamPreview() {
    if(!this.props.channelStore.streamActive || !this.state.previewStream) { return null; }

    return <VideoPreview objectId={this.props.channelStore.streamId} />;
  }

  ToggleStream() {
    const active = this.props.channelStore.streamActive;

    return (
      <Action
        className="toggle-stream-button"
        onClick={async () => (
          await Confirm({
            message: `Are you sure you want to ${active ? "stop" : "start"} the stream?`,
            onConfirm: active ? this.props.channelStore.StopStream : this.props.channelStore.StartStream
          })
        )}
      >
        { `${active ? "Stop" : "Start"} Stream` }
      </Action>
    );
  }

  SelectStream({libraryId, objectId}) {
    this.props.channelStore.SelectStream({libraryId, objectId});
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
            header="Live Stream Selection"
            objectOnly={true}
            onComplete={this.SelectStream}
            onCancel={this.CloseModal}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  Info() {
    const selectStreamButton = (
      <Action onClick={this.ActivateModal} className={this.props.channelStore.streamId ? "secondary" : ""}>
        { this.props.channelStore.streamId ? "Change Stream" : "Select Stream" }
      </Action>
    );

    if(!this.props.channelStore.streamId) {
      return (
        <React.Fragment>
          <h4 className="stream-info-header">Stream Info</h4>
          <div className="channel-stream-info">
            { selectStreamButton }
          </div>
        </React.Fragment>
      );
    }

    let previewStreamButton;
    if(this.props.channelStore.streamActive) {
      previewStreamButton = (
        <Action className="secondary" onClick={() => this.setState({previewStream: !this.state.previewStream})}>
          {this.state.previewStream ? "Hide" : "Show"} Preview
        </Action>
      );
    }

    const info = this.props.channelStore.streamInfo || {};
    const name = info.display_title || info.title || info.name;

    return (
      <React.Fragment>
        <h4 className="stream-info-header">Stream Info</h4>
        <div className="channel-stream-info">
          <div className={`stream-indicator ${this.props.channelStore.streamActive ? "stream-indicator-active" : "stream-indicator-inactive"}`}>
            <ImageIcon
              icon={this.props.channelStore.streamActive ? StreamActive : StreamInactive}
              title={this.props.channelStore.streamActive ? "Stream Active" : "Stream Inactive"}
            />
          </div>

          <div className="stream-info-name">
            { name }
            <IconButton
              className="open-object-link"
              icon={LinkIcon}
              label="Open stream object in new tab"
              onClick={() => this.props.rootStore.OpenObjectLink({
                libraryId: this.props.channelStore.streamLibraryId,
                objectId: this.props.channelStore.streamId
              })}
            />
          </div>
          <div className="light">{ this.props.channelStore.streamId }</div>
          <div className="light">{ info.originUrl }</div>
          <div className="stream-actions">
            { this.ToggleStream() }
            { previewStreamButton }
            { selectStreamButton }
          </div>
        </div>
        { this.StreamPreview() }
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="channel-stream-info-container">
        <div className="asset-info-container">
          { this.Info() }
        </div>

        { this.state.modal }
      </div>
    );
  }
}

@inject("channelStore")
@observer
class Channel extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container asset-form-live-container">
        <h3 className="live-header">
          Channel Management
        </h3>

        <StreamInfo />
        <Schedule />
      </div>
    );
  }
}

export default Channel;
