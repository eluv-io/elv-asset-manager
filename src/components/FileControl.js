import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, IconButton} from "elv-components-js";
import FileSelection from "./FileBrowser";
import OrderButtons from "./OrderButtons";

import DeleteIcon from "../static/icons/trash.svg";
import PreviewIcon from "./PreviewIcon";

@inject("formStore")
@observer
class FileControl extends React.Component {
  FileIcon(item) {
    const extension = ((item.path || "").split(".").pop() || "").toLowerCase();
    const isImage = ["apng", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(extension);

    if(!isImage) {
      return <div />;
    }

    return (
      <PreviewIcon
        imageKey={item.name}
        imagePath={item.path}
        targetHash={item.targetHash}
      />
    );
  }

  Item(info, index) {
    const control = this.props.control;

    return (
      <div
        key={`image-${index}`}
        className={`asset-form-list asset-form-configurable-file-control-entry${control.description ? "-with-description" : ""}`}
      >
        { this.FileIcon(info) }
        <input
          placeholder="Title..."
          className="image-key-input"
          value={info.title}
          onChange={event => this.props.formStore.UpdateFileControlItem({
            controlName: control.name,
            ...info,
            index,
            title: event.target.value
          })}
        />
        {
          control.description ?
            <textarea
              placeholder="Description..."
              className="image-key-input"
              value={info.description}
              onChange={event => this.props.formStore.UpdateFileControlItem({
                controlName: control.name,
                ...info,
                index,
                description: event.target.value
              })}
            /> : null
        }

        <div className="image-path" title={info.path}>{info.path}</div>
        <OrderButtons
          index={index}
          length={this.props.formStore.fileControlItems[this.props.control.name].length}
          Swap={(i1, i2) => this.props.formStore.SwapFileControlItem(control.name, i1, i2)}
        />
        <FileSelection
          header={`Select an item for '${info.title}'`}
          versionHash={info.targetHash}
          extensions={control.extensions}
          Select={({path, targetHash}) => this.props.formStore.UpdateFileControlItem({
            controlName: control.name,
            ...info,
            index,
            path,
            targetHash
          })}
        />
        <IconButton
          icon={DeleteIcon}
          title={`Remove ${info.title || "item"}`}
          onClick={() =>
            Confirm({
              message: "Are you sure you want to remove this item?",
              onConfirm: () => this.props.formStore.RemoveFileControlItem({controlName: control.name, index})
            })
          }
        />
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>{ this.props.control.name }</h3>
        <div className="asset-form-images-container">
          {
            this.props.formStore.fileControlItems[this.props.control.name].map((item, i) =>
              this.Item(item, i)
            )
          }
        </div>
        <Action onClick={() => this.props.formStore.AddFileControlItem({controlName: this.props.control.name})}>
          Add Item
        </Action>
      </div>
    );
  }
}

export default FileControl;
