import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import AsyncComponent from "./AsyncComponent";
import HLSPlayer from "hls.js";

@inject("contentStore")
@observer
class VideoPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: ""
    };

    this.Preview = this.Preview.bind(this);
    this.InitializeVideo = this.InitializeVideo.bind(this);
  }

  InitializeVideo(element) {
    if(!element) { return; }

    try {
      this.setState({errorMessage: undefined});
      const playoutUrl = this.props.contentStore.playoutOptions[this.props.versionHash].hls.playoutMethods.clear.playoutUrl;

      const player = new HLSPlayer();

      player.loadSource(playoutUrl);
      player.attachMedia(element);
    } catch (error) {
      this.setState({errorMessage: "Error loading video preview"});
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  Preview() {
    if(this.state.errorMessage) {
      return <div className="error-message">{this.state.errorMessage}</div>;
    }

    return (
      <div className="video-preview">
        <video
          crossOrigin="anonymous"
          ref={this.InitializeVideo}
          autoPlay={true}
          controls
          preload="auto"
        />
      </div>
    );
  }

  render() {
    return (
      <AsyncComponent
        Load={() => this.props.contentStore.LoadPlayoutOptions(this.props.versionHash)}
        render={this.Preview}
      />
    );
  }
}

VideoPreview.propTypes = {
  versionHash: PropTypes.string.isRequired
};

export default VideoPreview;
