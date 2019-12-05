import React from "react";
import {inject, observer} from "mobx-react";
import {Action, ImageIcon, ToolTip} from "elv-components-js";
import UrlJoin from "url-join";
import PreviewIcon from "../static/icons/image.svg";
import URI from "urijs";
import FileSelection from "./FileBrowser";

@inject("formStore")
@inject("contentStore")
@observer
class Images extends React.Component {
  PreviewIcon({imageKey, imagePath, targetHash}) {
    if(!imagePath) { return <div className="preview-icon" />; }

    const uri = URI(this.props.contentStore.baseFileUrls[targetHash]);
    uri.path(UrlJoin(uri.path(), imagePath).replace("//", "/"));

    return (
      <ToolTip
        key={`preview-icon-${imageKey}`}
        className={"file-image-preview-tooltip"}
        content={
          <img
            src={uri.toString()}
            alt={imagePath}
            className="file-image-preview"
          />
        }
      >
        <ImageIcon
          icon={PreviewIcon}
          label={"Preview " + imageKey}
          className="preview-icon"
        />
      </ToolTip>
    );
  }

  Image(imageInfo, index) {
    return (
      <div key={`image-${index}`} className="asset-form-image-entry asset-form-clip">
        { this.PreviewIcon(imageInfo) }
        <input
          className="image-key-input"
          value={imageInfo.imageKey}
          onChange={event => this.props.formStore.UpdateImage({
            ...imageInfo,
            index,
            imageKey: event.target.value
          })}
        />
        <div className="image-path">{imageInfo.imagePath}</div>
        <FileSelection
          header={`Select an image for '${imageInfo.imageKey}'`}
          versionHash={imageInfo.targetHash}
          Select={imagePath => this.props.formStore.UpdateImage({
            ...imageInfo,
            index,
            imagePath,
          })}
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
