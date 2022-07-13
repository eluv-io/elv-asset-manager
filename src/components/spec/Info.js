import React from "react";
import {inject, observer} from "mobx-react";
import {RecursiveField} from "../Inputs";
import {toJS} from "mobx";
import {Checkbox, Selection} from "elv-components-js";

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
  hint_link: "A URL link for a hint to point to",
  fields: "Attributes for each element in this list. If no fields are specified, this field will be a list of text strings.",
  for_title_types: "If specified, this field will only apply to assets with these title types",
  path: <>If specified, this field will change the location this field is saved in metadata. If blank, fields will be saved in <code>public/asset_metadata/info</code>, or <code>public/asset_metadata</code> if Top Level is specified. If the field is not at the top level (e.g. inside a list or a subsection), this field has no effect. Fields with non-standard paths are NOT localizable.</>,
  video_preview: "Specify this field for links to playable content. If enabled, a button to show an embedded preview of the content in the form will be available.",
  top_level: <>If specified, this field will be stored in <code>public/asset_metadata</code> instead of <code>public/asset_metadata/info</code>. If Metadata Path is specified, this field has no effect.</>
};

@inject("specStore")
@observer
class Info extends React.Component {
  InfoListField(name, values, Update, toplevel=false) {
    const types = [
      "header",
      "text",
      "textarea",
      "json",
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
      "file_url",
      "date",
      "datetime",
      "fabric_link",
      "metadata_link",
      "self_embed_url",
      "subsection",
      "list",
      "reference_subsection",
      "reference_list",
      "reference_type",
      "reference_select",
      "reference_multiselect",
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
          {name: "hint_link", hint: hints.hint_link, only: entry => !!entry.hint},
          {name: "no_localize", label: "No Localization", type: "checkbox", hint: "If checked, this field will not be displayed when filling out localized info"},
          {name: "top_level", type: "checkbox", hint: hints.top_level, only: () => toplevel},
          {name: "path", type: "text", label: "Metadata Path", hint: hints.path},
          {name: "for_title_types", type: "multiselect", hint: hints.for_title_types, options: this.props.specStore.availableTitleTypes, only: () => toplevel},
          {name: "type", type: "select", options: types, default: "text"},
          {name: "options", type: "list", only: entry => ["select", "multiselect"].includes(entry.type)},
          {name: "extensions", type: "list", only: entry => entry.type === "file" || entry.type === "file_url"},
          {name: "reference", only: entry => ["reference_subsection", "reference_list", "reference_type", "reference_select", "reference_multiselect"].includes(entry.type)},
          {name: "value_type", type: "select", options: types, default: types[0], only: entry => entry.type === "reference_subsection"},
          {name: "label_key", only: entry => ["reference_select", "reference_multiselect"].includes(entry.type)},
          {name: "value_key", only: entry => ["reference_select", "reference_multiselect"].includes(entry.type)},
          {name: "allow_null", type: "checkbox", default: false, only: entry => ["reference_select", "reference_multiselect"].includes(entry.type)},
          {name: "version", label: "Allow Version Selection", type: "checkbox", default: false, only: entry => ["fabric_link"].includes(entry.type)},
          {name: "version", label: "Use Version Hash", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},
          {name: "hash_only", label: "Version Hash Only (No link)", type: "checkbox", default: false, only: entry => ["fabric_link"].includes(entry.type)},
          {name: "no_label", label: "No Label", type: "checkbox", default: false, only: entry => ["color"].includes(entry.type)},
          {name: "video_preview", label: "Show Video Preview", type: "checkbox", hint: hints.video_preview, default: false, only: entry => ["fabric_link"].includes(entry.type)},

          // Embed video options
          {name: "auto_update", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},
          {name: "loop", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},
          {name: "autoplay", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},
          {name: "muted", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},
          {name: "hide_controls", type: "checkbox", default: false, only: entry => ["self_embed_url", "embed_url"].includes(entry.type)},

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
          <Checkbox
            name="Show Indexer Settings"
            value={this.props.specStore.showIndexerSettings}
            onChange={enabled => this.props.specStore.ToggleIndexerSettings(enabled)}
          />
          <Checkbox
            name="Playable"
            value={this.props.specStore.playable}
            onChange={enabled => this.props.specStore.TogglePlayable(enabled)}
          />
          <Checkbox
            name="Hide Images Tab"
            value={this.props.specStore.hideImageTab}
            onChange={hidden => this.props.specStore.ToggleImageTabHidden(hidden)}
          />
          <Selection
            name="displayApp"
            label="Display App"
            value={this.props.specStore.displayApp}
            options={[
              ["None", ""],
              ["Default", "default"],
              ["Asset Manager", "asset-manager"],
              ["Permissions Manager", "avails-manager"],
              ["Stream Sample", "stream-sample"]
            ]}
            onChange={newValue => this.props.specStore.UpdateApp("display", newValue)}
          />
          <Selection
            name="manageApp"
            label="Manage App"
            value={this.props.specStore.manageApp}
            options={[
              ["None", ""],
              ["Default", "default"],
              ["Asset Manager", "asset-manager"],
              ["Permissions Manager", "avails-manager"],
              ["Stream Sample", "stream-sample"]
            ]}
            onChange={newValue => this.props.specStore.UpdateApp("manage", newValue)}
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
