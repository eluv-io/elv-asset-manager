import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, IconButton} from "elv-components-js";
import Clips from "./Clips";

import DeleteIcon from "../static/icons/trash.svg";
import {Input} from "./Inputs";
import OrderButtons from "./OrderButtons";

@inject("formStore")
@observer
class Playlists extends React.Component {
  Playlist(playlist, index, length) {
    return (
      <div className="asset-form-playlist" key={`playlist-${index}`}>
        <div className="asset-form-playlist-key">
          <Input
            name="playlistKey"
            label="Playlist Key"
            value={playlist.playlistKey}
            onChange={playlistKey => this.props.formStore.UpdatePlaylist({index, playlistKey})}
          />
          <OrderButtons
            index={index}
            length={length}
            Swap={(i1, i2) => this.props.formStore.SwapPlaylist(i1, i2)}
          />
          <IconButton
            icon={DeleteIcon}
            className="remove-playlist-button"
            onClick={() =>
              Confirm({
                message: "Are you sure you want to remove this playlist?",
                onConfirm: () => this.props.formStore.RemovePlaylist(index)
              })
            }
          />
        </div>

        <Clips
          assetTypes={["clip", "primary", "trailer"]}
          playlistIndex={index}
          header={`'${playlist.playlistKey}' Clips`}
          name="Clip to Playlist"
          orderable
          defaultable
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
            this.Playlist(playlist, index, this.props.formStore.playlists.length)
          )}
        </div>
        <Action onClick={this.props.formStore.AddPlaylist}>Add Playlist</Action>
      </div>
    );
  }
}

export default Playlists;
