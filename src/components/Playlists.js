import React from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton} from "elv-components-js";
import Clips from "./Clips";

import DeleteIcon from "../static/icons/trash.svg";

@inject("formStore")
@observer
class Playlists extends React.Component {
  Playlist(playlist, index) {
    return (
      <div className="asset-form-playlist" key={`playlist-${index}`}>
        <input
          name="playlistKey"
          placeholder="Key..."
          value={playlist.playlistKey}
          onChange={event => this.props.formStore.UpdatePlaylist({index, playlistKey: event.target.value})}
        />
        <div className="playlist-clip-container">
          <Clips
            assetTypes={["clip", "primary", "trailer"]}
            playlistIndex={index}
            header="Playlist Clips"
            name="Clip"
          />
        </div>
        <IconButton
          icon={DeleteIcon}
          className="remove-playlist-button"
          onClick={() => this.props.formStore.RemovePlaylist(index)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Playlists</h3>
        <div className="asset-form-playlists-container">
          {this.props.formStore.playlists.map((playlist, index) =>
            this.Playlist(playlist, index)
          )}
        </div>
        <Action onClick={this.props.formStore.AddPlaylist}>Add Playlist</Action>
      </div>
    );
  }
}

export default Playlists;
