import React from "react";
import {inject, observer} from "mobx-react";
import {RecursiveField} from "../Inputs";
import {toJS} from "mobx";
import {Checkbox} from "elv-components-js";

/*
"info_fields": [
    {"name": "synopsis", "type": "textarea", "top_level": true},
    {"name": "copyright"},
    {"name": "mpaa_rating", "label": "MPAA Rating"},
    {"name": "mpaa_rating_reason", "label": "MPAA Rating Reason"},
    {"name": "runtime", "type": "integer"},
    {"name": "scripted", "type": "checkbox", "for_title_types": ["episode", "season", "series"]},
    {"name": "tv_rating", "label": "TV Rating"},
    {"name": "genre", "type": "multiselect", "options": ["Action", "Adventure", "Comedy", "Romance"]}
    {"name": "premiere_date", "type": "date"},
    {"name": "air_time", "type": "datetime", "zone": "utc"},
    {"name": "air_time_us_east", "label": "Air Time (US East)", "type": "datetime", "zone": "America/New_York"}
    {
      "name": "quotes",
      "type": "list",
      "fields": [
        {"name": "quote", "type": "textarea"},
        {"name": "author"}
      ]
    }
  ]

  (default) - Single line text input

textarea - Multiline text input

integer - Integer number

number - Decimal number

checkbox - True/false value

uuid - Auto generated UUID

select - Select from a list of options
- additional field: 'options' - List of allowable options

multiselect - Select mutliple from a list of options
- additional field: 'options' - List of allowable options

date - ISO 8601 date (e.g. `2020-03-15`)

file - Link to file

datetime - ISO 8601 datetime (e.g. `2020-03-15T13:55:47-0400`)
- additional field: 'zone' - Reference timezone for this datetime

list - A list of fields
- additional field: 'fields' - Recursive schema specifying the contents of each list item
```
 */

const hints = {
  info: <>A configurable list of fields for assets of this type. These fields will be stored in <code>public/asset_metadata/info</code> in the asset metadata.</>,
  hint: "A hint to communicate the purpose of this field, just like this one",
  fields: "Attributes for each element in this list. If no fields are specified, this field will be a list of text strings.",
  for_title_types: "If specified, this field will only apply to assets with these title types",
  top_level: <>If specified, this field will be stored in <code>public/asset_metadata</code> instead of <code>public/asset_metadata/info</code></>
};

@inject("specStore")
@observer
class Info extends React.Component {
  InfoListField(name, values, Update, toplevel=false) {
    const types = [
      "text",
      "textarea",
      "rich_text",
      "integer",
      "number",
      "uuid",
      "color",
      "checkbox",
      "select",
      "multiselect",
      "ntp_id",
      "file",
      "date",
      "datetime",
      "fabric_link",
      "subsection",
      "list",
      "reference_subsection",
      "reference_list"
    ].sort();

    const UpdateFields = (index, newFields) => {
      let newValues = [...toJS(values)];
      newValues[index].fields = newFields;

      Update(newValues);
    };

    return (
      <RecursiveField
        list
        key={`list-field-${name}`}
        name={name}
        values={values}
        orderable
        hint={toplevel ? hints.info : hints.fields}
        fields={[
          {name: "label"},
          {name: "name", label: "Metadata Key", required: true},
          {name: "hint", hint: hints.hint},
          {name: "no_localize", label: "No Localization", type: "checkbox", hint: "If checked, this field will not be displayed when filling out localized info"},
          {name: "top_level", type: "checkbox", hint: hints.top_level, only: () => toplevel},
          {name: "for_title_types", type: "multiselect", hint: hints.for_title_types, options: this.props.specStore.availableTitleTypes, only: () => toplevel},
          {name: "type", type: "select", options: types, default: "text"},
          {name: "options", type: "list", only: entry => ["select", "multiselect"].includes(entry.type)},
          {name: "extensions", type: "list", only: entry => entry.type === "file"},
          {name: "reference", only: entry => ["reference_subsection", "reference_list"].includes(entry.type)},
          {name: "value_type", type: "select", options: types, default: types[0], only: entry => entry.type === "reference_subsection"},
          {
            name: "fields",
            type: "list",
            only: entry => ["list", "subsection", "reference_list", "reference_subsection"].includes(entry.type),
            render: index => this.InfoListField("Fields", values[index].fields, newValues => UpdateFields(index, newValues))
          }
        ]}
        Update={(_, newValues) => Update(newValues)}
      />
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Asset Info Fields</h3>
        <div className="asset-info-container">
          <Checkbox
            name="Associate Permissions Object"
            value={this.props.specStore.associatePermissions}
            onChange={enabled => this.props.specStore.TogglePermissionAssociation(enabled)}
          />
          <RecursiveField
            list
            name="Asset Types"
            orderable
            values={this.props.specStore.availableAssetTypes}
            Update={(_, types, operation) => this.props.specStore.UpdateAssetTypes(types, operation)}
          />
          <RecursiveField
            list
            name="Title Types"
            orderable
            values={this.props.specStore.availableTitleTypes}
            Update={(_, types, operation) => this.props.specStore.UpdateTitleTypes(types, operation)}
          />
          { this.InfoListField("Asset Info Fields", this.props.specStore.infoFields, this.props.specStore.UpdateAssetInfoFields, true) }
        </div>
      </div>
    );
  }
}

export default Info;
