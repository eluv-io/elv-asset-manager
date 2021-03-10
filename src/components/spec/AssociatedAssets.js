import React from "react";
import {inject, observer} from "mobx-react";
import {RecursiveField} from "../Inputs";

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

const hints = {
  associated_assets: "Here you can configure controls to allow associating other assets, such as titles, clips or trailers, with assets of this type",
  asset_types: "If specified, only assets with the specified asset type(s) may be added this list",
  title_types: "If specified, only assets with the specified title type(s) may be added to this list",
  name: <React.Fragment>These associated assets will be store stored in <code>public/asset_metadata/{"<Metadata Key>"}</code></React.Fragment>,
  for_title_types: "If specified, only assets of the specified title type(s) will have this list",
  indexed: (
    <React.Fragment>
      {`
Whether or not entries in this list should be referenced by a numerical index in the metadata

When indexed but not slugged, associated assets will be stored in the following format:
      `}
      <code>
        {`
"titles": {
  "0": { ... },
  "1": { ... },
  ...
}
      `}
      </code>

      {`
When slugged and indexed:
      `}

      <code>
        {`
"titles": {
  "0": {
     "asset-1-slug": { ... },
   },
   "1": {
     "asset-2-slug": { ... }
   },
   ...
}
      `}
      </code>

      {`
And when neither slugged nor indexed:
      `}

      <code>
        {`
"titles": [
  { ...asset-1 },
  { ...asset-2 }
]
      `}
      </code>
    </React.Fragment>
  ),
  slugged: (
    <React.Fragment>
      {`
Whether or not entries in this list should be referenced by their slug in the metadata

When slugged but not indexed, associated assets will be stored in the following format:
      `}
      <code>
        {`
"titles": {
  "asset-1-slug": { ... },
  "asset-2-slug": { ... }
  ...
}
      `}
      </code>

      {`
When slugged and indexed:
      `}

      <code>
        {`
"titles": {
  "0": {
     "asset-1-slug": { ... },
   },
   "1": {
     "asset-2-slug": { ... }
   },
   ...
}
      `}
      </code>

      {`
And when neither slugged nor indexed:
      `}

      <code>
        {`
"titles": [
  { ...asset-1 },
  { ...asset-2 }
]
      `}
      </code>
    </React.Fragment>
  ),
  defaultable: "If specified, an entry in this list may be specified as the 'default' entry",
  orderable: "If specified, entries in this list can be reordered"
};

@inject("specStore")
@observer
class AssociatedAssets extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Associated Assets</h3>
        <div className="asset-info-container">
          <RecursiveField
            list
            name="Associated Assets"
            values={this.props.specStore.associatedAssets}
            hint={hints.associated_assets}
            orderable
            fields={[
              {name: "label"},
              {name: "name", label: "Metadata Key", hint: hints.name, required: true},
              {name: "asset_types", type: "multiselect", options: this.props.specStore.availableAssetTypes, hint: hints.asset_types},
              {name: "title_types", type: "multiselect", options: this.props.specStore.availableTitleTypes, hint: hints.title_types},
              {name: "for_title_types", type: "multiselect", options: this.props.specStore.availableTitleTypes, hint: hints.for_title_types},
              {name: "indexed", type: "checkbox", hint: hints.indexed},
              {name: "slugged", type: "checkbox", hint: hints.slugged},
              {name: "defaultable", type: "checkbox", hint: hints.defaultable, only: associatedAsset => associatedAsset.indexed || associatedAsset.slugged},
              {name: "orderable", type: "checkbox", hint: hints.orderable, only: associatedAsset => associatedAsset.indexed}
            ]}
            Update={(_, newValues) => this.props.specStore.UpdateAssociatedAssets(newValues)}
          />
        </div>
      </div>
    );
  }
}

export default AssociatedAssets;
