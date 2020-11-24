import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, IconButton, Input} from "elv-components-js";
import Clips from "./Clips";

import DeleteIcon from "../static/icons/trash.svg";
import OrderButtons from "./OrderButtons";

@inject("formStore")
@observer
class Playlists extends React.Component {
  Playlist(playlist, index, length) {
    return (
      <div className="asset-form-playlist" key={`playlist-${index}`}>
        <div className="asset-form-playlist-name">
          <Input
            name="playlistName"
            label="Playlist Name"
            value={playlist.playlistName}
            onChange={playlistName => this.props.formStore.UpdatePlaylist({index, key: "playlistName", value: playlistName})}
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

        <div className="asset-form-playlist-slug">
          <Input
            name="playlistSlug"
            label="Playlist Slug"
            value={playlist.playlistSlug}
            onChange={playlistSlug => this.props.formStore.UpdatePlaylist({index, key: "playlistSlug", value: playlistSlug})}
          />
        </div>

        <Clips
          playlistIndex={index}
          header={`'${playlist.playlistName}' Clips`}
          name="Item"
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
          {this.props.formStore.currentLocalizedData.playlists.map((playlist, index) =>
            this.Playlist(playlist, index, this.props.formStore.currentLocalizedData.playlists.length)
          )}
        </div>
        <Action onClick={this.props.formStore.AddPlaylist}>Add Playlist</Action>
      </div>
    );
  }
}

export default Playlists;
