import React from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton} from "elv-components-js";
import FileSelection from "./FileBrowser";
import PreviewIcon from "./PreviewIcon";

import DeleteIcon from "../static/icons/trash.svg";

@inject("formStore")
@inject("contentStore")
@observer
class Images extends React.Component {
  Image(imageInfo, index) {
    return (
      <div key={`image-${index}`} className="asset-form-image-entry asset-form-clip">
        <PreviewIcon {...imageInfo} />
        <input
          placeholder="Key..."
          className="image-key-input"
          value={imageInfo.imageKey}
          onChange={event => this.props.formStore.UpdateImage({
            ...imageInfo,
            index,
            imageKey: event.target.value
          })}
        />
        <div className="image-path" title={imageInfo.imagePath}>{imageInfo.imagePath}</div>
        <FileSelection
          header={`Select an image for '${imageInfo.imageKey}'`}
          versionHash={imageInfo.targetHash}
          Select={imagePath => this.props.formStore.UpdateImage({
            ...imageInfo,
            index,
            imagePath,
          })}
        />
        <IconButton
          icon={DeleteIcon}
          title={`Remove ${imageInfo.imageKey || "image"}`}
          onClick={() => this.props.formStore.RemoveImage(index)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Images</h3>
        <div className="asset-form-images-container">
          {this.props.formStore.images.map((image, i) => this.Image(image, i))}
        </div>
        <Action onClick={this.props.formStore.AddImage}>Add Image</Action>
      </div>
    );
  }
}

export default Images;
