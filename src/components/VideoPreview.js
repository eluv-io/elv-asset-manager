import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import {EluvioPlayer, EluvioPlayerParameters} from "@eluvio/elv-player-js";

@inject("rootStore")
@inject("contentStore")
@observer
class VideoPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      player: undefined,
      errorMessage: ""
    };
  }

  render() {
    if(this.state.errorMessage) {
      return <div className="error-message">{this.state.errorMessage}</div>;
    }

    return (
      <div className="video-preview">
        <div
          ref={element => {
            if(!element || this.state.player) { return; }

            this.setState({
              player: (
                new EluvioPlayer(
                  element,
                  {
                    clientOptions: {
                      client: this.props.rootStore.client
                    },
                    sourceOptions: {
                      playoutParameters: {
                        versionHash: this.props.versionHash
                      }
                    },
                    playerOptions: {
                      watermark: EluvioPlayerParameters.watermark.OFF,
                      muted: EluvioPlayerParameters.muted.OFF,
                      autoplay: EluvioPlayerParameters.autoplay.OFF,
                      controls: EluvioPlayerParameters.controls.ON,
                      loop: EluvioPlayerParameters.loop.OFF,
                      playerCallback: ({videoElement}) => this.setState({video: videoElement}),
                      errorCallback: (error) => this.setState({errorMessage: error.message || error.toString()})
                    }
                  }
                )
              )
            });
          }}
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
