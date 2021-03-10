import React, {useState} from "react";
import {Action, Confirm, IconButton, LabelledField, Modal} from "elv-components-js";
import ContentBrowser from "./ContentBrowser";

import RemoveIcon from "../static/icons/trash.svg";

const ObjectSelection = ({
  selectedObject,
  browseHeader="Select an object",
  buttonText="Select an object",
  Select,
  Remove,
  className=""
}) => {
  const [modal, setModal] = useState(null);

  const ActivateModal = () => {
    setModal(
      <Modal
        className="asset-form-modal"
        closable={true}
        OnClickOutside={() => setModal(null)}
      >
        <ContentBrowser
          header={browseHeader}
          objectOnly
          onComplete={async (args) => {
            await Select(args);

            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    );
  };

  let selected;
  if(selectedObject) {
    selected = (
      <div className="asset-form-object-selection-selected">
        { selectedObject.name }
        <IconButton
          title="Remove Item"
          icon={RemoveIcon}
          onClick={async () => await Confirm({
            message: "Are you sure you want to remove this item?",
            onConfirm: async () => await Remove()
          })}
        />
      </div>
    );
  }

  return (
    <div className={`asset-form-object-selection ${className || ""}`}>
      <LabelledField label="Permissions" className="asset-form-object-selection-contents">
        { selected }
        <Action onClick={ActivateModal}>
          { buttonText }
        </Action>
      </LabelledField>

      { modal }
    </div>
  );
};

export default ObjectSelection;
