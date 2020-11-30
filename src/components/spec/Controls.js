import React from "react";
import {Checkbox} from "elv-components-js";
import {inject, observer} from "mobx-react";
import {ListField} from "../Inputs";

@inject("specStore")
@observer
class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  /*
    {
    "_id": 1,
    "description": true,
    "extensions": [
      "apng",
      "gif",
      "jpg",
      "jpeg",
      "png",
      "svg",
      "tif",
      "tiff",
      "webp"
    ],
    "linkKey": "image",
    "name": "Gallery",
    "target": "/public/asset_metadata/gallery",
    "thumbnail": true,
    "type": "files"
  }
   */

  FileControls() {
    const fileControls = Object.values(this.props.specStore.controls).filter(control => !control.simple);

    return (
      <ListField
        name="File Controls"
        label="File Controls"
        values={fileControls}
        orderable
        fields={[
          { name: "name" },
          { name: "description", type: "checkbox", default: false },
          { name: "link_key", label: "Link Key", default: "file" },
          { name: "target", label: "Link Target", default: "/public/asset_metadata/files" },
          { name: "thumbnail", type: "checkbox", label: "Thumbnail Links", default: false },
          {
            name: "extensions",
            label: "File Extensions",
            type: "list"
          }
        ]}
        Update={(_, newValues) => this.props.specStore.UpdateFileControls(newValues)}
      />
    );
  }

  SimpleControl(name) {
    const enabled = this.props.specStore.controls[name];

    return (
      <div className="control simple-control">
        <Checkbox name={name} value={enabled} onChange={() => this.props.specStore.ToggleSimpleControl(name)} />
      </div>
    );
  }

  Images() {
    return (
      <div className="control simple-control">
        <Checkbox name="Images" value={true} disabled />
        <div className="indented image-keys-list">
          <ListField
            orderable
            name="Default Image Keys"
            label={"Default Image Keys"}
            values={this.props.specStore.defaultImageKeys}
            Update={(_, newValues) => this.props.specStore.UpdateImageKeys(newValues)}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Controls</h3>
        <div className="asset-info-container">
          { this.Images() }
          { this.SimpleControl("playlists") }
          { this.SimpleControl("credits") }
          { this.SimpleControl("channel") }
          { this.SimpleControl("live_stream") }
        </div>

        <h3>Additional File Controls</h3>
        <div className="asset-info-container">
          { this.FileControls() }
        </div>
      </div>
    );
  }
}

export default Controls;
