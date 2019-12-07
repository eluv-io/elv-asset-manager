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

    this.Preview = this.Preview.bind(this);
    this.InitializeVideo = this.InitializeVideo.bind(this);
  }

  InitializeVideo(element) {
    if(!element) { return; }

    const playoutUrl = this.props.contentStore.playoutOptions[this.props.versionHash].hls.playoutMethods.clear.playoutUrl;

    const player = new HLSPlayer();

    player.loadSource(playoutUrl);
    player.attachMedia(element);
  }

  Preview() {
    return (
      <div className="video-preview">
        <video
          crossOrigin="anonymous"
          ref={this.InitializeVideo}
          autoPlay={false}
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
