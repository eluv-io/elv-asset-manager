import React from "react";
import PropTypes from "prop-types";
import {Action, Confirm, IconButton, LabelledField, Modal} from "elv-components-js";
import ContentBrowser from "./ContentBrowser";

import RemoveIcon from "../static/icons/trash.svg";
import LinkIcon from "../static/icons/external-link.svg";
import UpdateLinkIcon from "../static/icons/arrow-up-circle.svg";
import PlayIcon from "../static/icons/play-circle.svg";
import StopIcon from "../static/icons/x-circle.svg";
import {inject, observer} from "mobx-react";
import VideoPreview from "./VideoPreview";

@inject("rootStore")
@observer
class ObjectSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
      showPreview: false
    };
  }

  CloseModal() {
    this.setState({modal: null});
  }

  ActivateModal() {
    this.setState({
      modal: (
        <Modal
          className="asset-form-modal"
          closable={true}
          OnClickOutside={() => this.CloseModal()}
        >
          <ContentBrowser
            header={this.props.browseHeader ||  "Select an object"}
            objectOnly={this.props.objectOnly}
            offering={this.props.offering}
            onComplete={async (args) => {
              await this.props.Select(args);

              this.CloseModal();
            }}
            onCancel={() => this.CloseModal()}
          />
        </Modal>
      )
    });
  }

  render() {
    let selected;
    if(this.props.selectedObject) {
      selected = (
        <div className="asset-form-object-selection-selected">
          { this.props.selectedObject.name } { this.props.selectedObject.offering ? `(Offering: ${this.props.selectedObject.offering})` : ""}
          <div className="asset-form-object-selection-actions">
            {
              this.props.videoPreview ?
                <IconButton
                  className="show-preview"
                  icon={this.state.showPreview ? StopIcon : PlayIcon}
                  label={this.state.showPreview ? "Hide Preview" : "Show Preview"}
                  onClick={() => this.setState({showPreview: !this.state.showPreview})}
                /> : null
            }
            <IconButton
              className="update-object-link"
              icon={UpdateLinkIcon}
              label="Update link"
              onClick={async () =>
                await Confirm({
                  message: `Are you sure you want to update '${this.props.selectedObject.name}'?`,
                  onConfirm: () => this.props.Update()
                })
              }
            />
            <IconButton
              className="open-object-link"
              icon={LinkIcon}
              label="Open object in new tab"
              onClick={() => this.props.rootStore.OpenObjectLink({versionHash: this.props.selectedObject.versionHash})}
            />
            <IconButton
              title="Remove Item"
              icon={RemoveIcon}
              onClick={async () => await Confirm({
                message: "Are you sure you want to remove this item?",
                onConfirm: async () => await this.props.Remove()
              })}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={`asset-form-object-selection ${this.props.className || ""}`}>
        <LabelledField label={this.props.label} className="asset-form-object-selection-contents">
          { selected }
          <Action onClick={() => this.ActivateModal()}>
            { this.props.buttonText || "Select an object" }
          </Action>
          {
            this.state.showPreview && selected ?
              <div className="asset-form-object-selection-preview-container" key={this.props.selectedObject.versionHash}>
                <VideoPreview versionHash={this.props.selectedObject.versionHash}/>
              </div> : null
          }
        </LabelledField>

        { this.state.modal }
      </div>
    );
  }
}

ObjectSelection.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  browseHeader: PropTypes.string,
  buttonText: PropTypes.string,
  selectedObject: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  version: PropTypes.bool,
  offering: PropTypes.bool,
  Select: PropTypes.func.isRequired,
  Update: PropTypes.func.isRequired,
  Remove: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ObjectSelection;
