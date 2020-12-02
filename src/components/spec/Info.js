import React from "react";
import {inject, observer} from "mobx-react";
import {ListField} from "../Inputs";
import {toJS} from "mobx";

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

select - Select from a list of options
- additional field: 'options' - List of allowable options

multiselect - Select mutliple from a list of options
- additional field: 'options' - List of allowable options

date - ISO 8601 date (e.g. `2020-03-15`)

datetime - ISO 8601 datetime (e.g. `2020-03-15T13:55:47-0400`)
- additional field: 'zone' - Reference timezone for this datetime

list - A list of fields
- additional field: 'fields' - Recursive schema specifying the contents of each list item
```
 */

const hints = {
  info: <>A configurable list of fields for assets of this type. These fields will be stored in <code>public/asset_metadata/info</code> in the asset metadata.</>,
  fields: "Attributes for each element in this list",
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
      "integer",
      "number",
      "checkbox",
      "select",
      "multiselect",
      "date",
      "datetime",
      "list"
    ];

    const UpdateFields = (index, newFields) => {
      let newValues = [...toJS(values)];
      newValues[index].fields = newFields;

      Update(newValues);
    };

    return (
      <ListField
        key={`list-field-${name}`}
        name={name}
        values={values}
        orderable
        hint={toplevel ? hints.info : hints.fields}
        fields={[
          {name: "label"},
          {name: "name", label: "Metadata Key"},
          {name: "top_level", type: "checkbox", hint: hints.top_level, only: () => toplevel},
          {name: "for_title_types", type: "multiselect", hint: hints.for_title_types, options: this.props.specStore.availableTitleTypes, only: () => toplevel},
          {name: "type", type: "select", options: types, default: types[0]},
          {name: "options", type: "list", only: entry => ["select", "multiselect"].includes(entry.type)},
          {
            name: "fields",
            type: "list",
            only: entry => entry.type === "list",
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
          <ListField
            name="Asset Types"
            orderable
            values={this.props.specStore.availableAssetTypes}
            Update={(_, types) => this.props.specStore.UpdateAssetTypes(types)}
          />
          <ListField
            name="Title Types"
            orderable
            values={this.props.specStore.availableTitleTypes}
            Update={(_, types) => this.props.specStore.UpdateTitleTypes(types)}
          />
          { this.InfoListField("Asset Info Fields", this.props.specStore.infoFields, this.props.specStore.UpdateAssetInfoFields, true) }
        </div>
      </div>
    );
  }
}

export default Info;
