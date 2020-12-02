import React from "react";
import {Checkbox} from "elv-components-js";
import {inject, observer} from "mobx-react";
import {ListField} from "../Inputs";

const hints = {
  default_image_keys: "These image keys will be populated by default for all assets.",
  link_key: "What the link to the file will be called in the metadata. Default: 'file'",
  target: (
    <React.Fragment>
      The location in the metadata to store the file information. Default: <code>public/asset_metadata/files</code>
      <br /> <br />
      Note: File controls with metadata targets outside of public/asset_metadata cannot be localized.
    </React.Fragment>
  ),
  thumbnail: "If these files may be images, enabling this will allow previewing selected images in the selector",
  extensions: "Allowed file extensions (e.g. jpg, png, txt, pdf). If none are specified, all file types will be allowed"
};

@inject("specStore")
@observer
class Controls extends React.Component {
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
          { name: "link_key", label: "Link Key", default: "file", hint: hints.link_key },
          { name: "target", label: "Link Target", default: "/public/asset_metadata/files", hint: hints.target },
          { name: "thumbnail", type: "checkbox", label: "Thumbnail Links", default: false, hint: hints.thumbnail },
          {
            name: "extensions",
            label: "File Extensions",
            type: "list",
            hint: hints.extensions
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
            hint={hints.default_image_keys}
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
