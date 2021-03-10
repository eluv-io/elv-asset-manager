import React from "react";
import {inject, observer} from "mobx-react";
import {RecursiveField} from "../Inputs";

const hints = {
  localization: (
    <React.Fragment>
      Specify a list of options with which assets can be localized, such as languages or territories. If localization options are specified,
      most attributes of assets can be localized for each option, such as info fields, associated assets, playlists, credits, etc.

      <br /><br />

      The <code>AssetMetadata</code> method of the
      elv-client-js JavaScript client can be used to retrieve localized asset metadata. This method will automatically merge the default asset metadata
      and localization data for the specified locale, with the localized data overwriting the defaults.
    </React.Fragment>
  ),
  depth: (
    <React.Fragment>
      {`
Localizations can either be a list (e.g. a list of languages)
      `}
      <code>
        {`
"info_locals": [
  "DE",
  "EN",
  "ES",
  "FR",
  "IT"
]
      `}
      </code>
      {`
or a map of key -> list (e.g. a list of territories, each containing a list of languages)
      `}
      <code>
        {`
"info_territories": [
  "United States": [
    "EN",
    "ES"
  ],
  "France": [
    "FR"
  ],
  "Switzerland": [
    "DE",
    "FR",
    "IT"
  ]
]
      `}
      </code>
    </React.Fragment>
  )
};

@inject("specStore")
@observer
class Localization extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Localization Options</h3>
        <div className="asset-info-container">
          <RecursiveField
            list
            name="Localization"
            values={this.props.specStore.localizations}
            hint={hints.localization}
            defaultValue={
              { key: "New Localization", depth: 2, options: [] }
            }
            fields={[
              { name: "key" },
              { name: "depth", label: "Format", type: "select", options: [["List", 2], ["Key -> List", 3]], hint: hints.depth },
              {
                name: "options",
                only: ({depth}) => parseInt(depth) === 2,
                type: "list"
              },
              {
                name: "options",
                only: ({depth}) => parseInt(depth) === 3,
                type: "list",
                fields: [
                  { name: "key" },
                  { name: "options", type: "list" }
                ]
              }
            ]}
            Update={(_, newValues, operation) => this.props.specStore.UpdateLocalizations(newValues, operation)}
          />
        </div>
      </div>
    );
  }
}

export default Localization;
