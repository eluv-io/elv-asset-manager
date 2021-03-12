import React from "react";
import PropTypes from "prop-types";
import {Action, Confirm, IconButton, LabelledField, Modal} from "elv-components-js";
import ContentBrowser from "./ContentBrowser";

import RemoveIcon from "../static/icons/trash.svg";
import LinkIcon from "../static/icons/external-link.svg";
import {inject, observer} from "mobx-react";

@inject("rootStore")
@observer
class ObjectSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null
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
            objectOnly
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
          { this.props.selectedObject.name }
          <div className="asset-form-object-selection-actions">
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
        </LabelledField>

        { this.state.modal }
      </div>
    );
  }
}

ObjectSelection.propTypes = {
  label: PropTypes.string.isRequired,
  browseHeader: PropTypes.string,
  buttonText: PropTypes.string,
  selectedObject: PropTypes.object,
  Select: PropTypes.func.isRequired,
  Remove: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ObjectSelection;
