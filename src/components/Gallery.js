import React from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton} from "elv-components-js";
import FileSelection from "./FileBrowser";
import PreviewIcon from "./PreviewIcon";
import OrderButtons from "./OrderButtons";

import DeleteIcon from "../static/icons/trash.svg";

@inject("formStore")
@observer
class Gallery extends React.Component {
  GalleryImage(imageInfo, index) {
    return (
      <div key={`image-${index}`} className="asset-form-gallery-image-entry">
        <PreviewIcon {...imageInfo} />
        <input
          placeholder="Title..."
          className="image-key-input"
          value={imageInfo.title}
          onChange={event => this.props.formStore.UpdateGalleryImage({
            ...imageInfo,
            index,
            title: event.target.value
          })}
        />
        <textarea
          placeholder="Description..."
          className="image-key-input"
          value={imageInfo.description}
          onChange={event => this.props.formStore.UpdateGalleryImage({
            ...imageInfo,
            index,
            description: event.target.value
          })}
        />
        <div className="image-path" title={imageInfo.imagePath}>{imageInfo.imagePath}</div>
        <OrderButtons
          index={index}
          length={this.props.formStore.gallery.length}
          Swap={this.props.formStore.SwapGalleryImage}
        />
        <FileSelection
          header={`Select an image for '${imageInfo.imageKey}'`}
          versionHash={imageInfo.targetHash}
          Select={imagePath => this.props.formStore.UpdateGalleryImage({
            ...imageInfo,
            index,
            imagePath,
          })}
        />
        <IconButton
          icon={DeleteIcon}
          title={`Remove ${imageInfo.imageKey || "image"}`}
          onClick={() => this.props.formStore.RemoveGalleryImage(index)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Gallery</h3>
        <div className="asset-form-images-container">
          {this.props.formStore.gallery.map((image, i) => this.GalleryImage(image, i))}
        </div>
        <Action onClick={this.props.formStore.AddGalleryImage}>Add Image</Action>
      </div>
    );
  }
}

export default Gallery;
