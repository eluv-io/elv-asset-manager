import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import HLSPlayer from "hls.js";

@inject("contentStore")
@observer
class VideoPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      versionHash: "",
      errorMessage: ""
    };

    this.InitializeVideo = this.InitializeVideo.bind(this);
  }

  componentWillUnmount() {
    if(this.player) {
      this.player.destroy();
    }
  }

  async InitializeVideo(element) {
    if(!element) { return; }

    try {
      this.setState({errorMessage: undefined});

      const versionHash = await this.props.contentStore.LoadPlayoutOptions({
        objectId: this.props.objectId,
        versionHash: this.props.versionHash
      });

      const playoutMethods = this.props.contentStore.playoutOptions[versionHash].hls.playoutMethods;
      // Prefer AES playout
      const playoutUrl = (playoutMethods["aes-128"] || playoutMethods.clear).playoutUrl;

      this.player = new HLSPlayer();

      this.player.loadSource(playoutUrl);
      this.player.attachMedia(element);
    } catch (error) {
      this.setState({errorMessage: "Error loading video preview"});
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  render() {
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
}

VideoPreview.propTypes = {
  objectId: PropTypes.string,
  versionHash: PropTypes.string
};

export default VideoPreview;
