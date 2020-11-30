import React from "react";
import {inject, observer} from "mobx-react";
import {ListField} from "../Inputs";

/*
      {
        name: "series",
        label: "Series",
        asset_types: ["primary"],
        title_types: ["series"],
        for_title_types: ["site", "collection"],
        indexed: true,
        slugged: true,
        defaultable: false,
        orderable: true
      },
 */

@inject("specStore")
@observer
class AssociatedAssets extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Associated Assets</h3>
        <div className="asset-info-container">
          <ListField
            name="Associated Assets"
            values={this.props.specStore.associatedAssets}
            orderable
            prepend
            fields={[
              {name: "label"},
              {name: "name", label: "Metadata Key"},
              {name: "asset_types", type: "multiselect", options: this.props.specStore.availableAssetTypes},
              {name: "title_types", type: "multiselect", options: this.props.specStore.availableTitleTypes},
              {name: "for_title_types", type: "multiselect", options: this.props.specStore.availableTitleTypes},
              {name: "indexed", type: "checkbox"},
              {name: "slugged", type: "checkbox"},
              {name: "defaultable", type: "checkbox"},
              {name: "orderable", type: "checkbox"}
            ]}
            Update={(_, newValues) => this.props.specStore.UpdateAssociatedAssets(newValues)}
          />
        </div>
      </div>
    );
  }
}

export default AssociatedAssets;
