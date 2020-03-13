import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, ImageIcon, Modal} from "elv-components-js";

import StreamActive from "../static/icons/video.svg";
import StreamInactive from "../static/icons/video-off.svg";
import VideoPreview from "./VideoPreview";
import ContentBrowser from "./ContentBrowser";

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
      <Action onClick={this.ActivateModal}>
        { this.props.channelStore.streamId ? "Change Stream" : "Select Stream" }
      </Action>
    );

    if(!this.props.channelStore.streamId) {
      return selectStreamButton;
    }

    let previewStreamButton;
    if(this.props.channelStore.streamActive) {
      previewStreamButton = (
        <Action onClick={() => this.setState({previewStream: !this.state.previewStream})}>
          {this.state.previewStream ? "Hide" : "Show"} Preview
        </Action>
      );
    }

    const info = this.props.channelStore.streamInfo || {};
    const name = info.display_title || info.title || info.name;

    return (
      <React.Fragment>
        <h3 className="stream-info-header">Stream Info</h3>
        <div className="channel-stream-info">
          <div className={`stream-indicator ${this.props.channelStore.streamActive ? "stream-indicator-active" : "stream-indicator-inactive"}`}>
            <ImageIcon
              icon={this.props.channelStore.streamActive ? StreamActive : StreamInactive}
              title={this.props.channelStore.streamActive ? "Stream Active" : "Stream Inactive"}
            />
          </div>

          <div>{ name }</div>
          <div className="light">{ this.props.channelStore.streamId }</div>
          <div className="light">{ info.originUrl }</div>
          <div className="stream-actions">
            { this.ToggleStream() }
            { selectStreamButton }
            { previewStreamButton }
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
      </div>
    );
  }
}

export default Channel;
