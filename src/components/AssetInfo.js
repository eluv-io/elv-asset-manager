import React from "react";
import {inject, observer} from "mobx-react";
import {
  Input,
  TextArea,
  Selection,
  MultiSelect,
  Checkbox,
  LabelledField,
  Warning,
  DateSelection
} from "elv-components-js";
import {Confirm, IconButton} from "elv-components-js";
import {toJS} from "mobx";

import AddIcon from "../static/icons/plus-square.svg";
import DeleteIcon from "../static/icons/trash.svg";

const InfoField = ({field, entry, Update}) => {
  if(field.type === "textarea") {
    return (
      <TextArea
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "checkbox") {
    return (
      <Checkbox
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "date" || field.type === "datetime") {
    return (
      <DateSelection
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        value={entry[field.name]}
        dateOnly={field.type === "date"}
        referenceTimezone={field.zone}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "select") {
    return (
      <Selection
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        value={entry[field.name]}
        options={field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "multiselect") {
    return (
      <MultiSelect
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        values={entry[field.name]}
        options={field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "list") {
    return (
      <ListField
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        values={entry[field.name] || []}
        fields={field.fields}
        UpdateAssetInfo={(name, newValues) => Update(field.name, newValues)}
      />
    );
  } else {
    return (
      <Input
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        type={field.type}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  }
};

const ListField = ({name, label, values, fields, UpdateAssetInfo}) => {
  const Update = (index, fieldName, newValue) => {
    let newValues = [...toJS(values)];
    newValues[index][fieldName] = newValue;

    UpdateAssetInfo(name, newValues);
  };

  const Add = () => {
    let newValues = [...toJS(values)];

    let newValue = {};
    fields.forEach(field => newValue[field.name] = "");

    newValues.push(newValue);

    UpdateAssetInfo(name, newValues);
  };

  const Remove = (index) => {
    let newValues = [...toJS(values)];

    newValues = newValues.filter((_, i) => i !== index);

    UpdateAssetInfo(name, newValues);
  };

  const fieldInputs =
    (values || []).map((entry, index) => {
      entry = entry || {};

      const entryFields = fields.map(field =>
        InfoField({
          field,
          entry,
          Update: (entryName, newValue) => Update(index, entryName, newValue)
        })
      );

      return (
        <div
          className={`asset-info-list-field-entry ${index % 2 === 0 ? "even" : "odd"}`}
          key={`input-container-${name}-${index}`}
        >
          <IconButton
            icon={DeleteIcon}
            title={`Remove ${label || name}`}
            onClick={async () => await Confirm({
              message: `Are you sure you want to remove this entry from ${label || name}?`,
              onConfirm: () => Remove(index)
            })}
            className="info-list-icon info-list-remove-icon"
          />
          { entryFields }
        </div>
      );
    });

  return (
    <LabelledField
      label={label || name}
      formatLabel={!label}
      value={
        <div className="asset-info-list-field">
          <IconButton
            icon={AddIcon}
            title={`Add ${label || name}`}
            onClick={Add}
            className="info-list-icon"
          />
          { fieldInputs }
        </div>
      }
    />
  );
};

@inject("formStore")
@observer
class AssetInfo extends React.Component {
  // Generate list of inputs as defined in infoFields
  InfoFields() {
    // Filter fields not applicable to current title type
    const fields = this.props.formStore.infoFields
      .filter(({for_title_types}) =>
        !for_title_types ||
        for_title_types.length === 0 ||
        for_title_types.includes(this.props.formStore.assetInfo.title_type)
      );

    return fields.map(field =>
      InfoField({
        field,
        entry: this.props.formStore.assetInfo,
        Update: this.props.formStore.UpdateAssetInfo
      })
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Asset Info</h3>
        <div className="asset-info-container">
          <Selection
            name="title_type"
            value={this.props.formStore.assetInfo.title_type}
            onChange={title_type => this.props.formStore.UpdateAssetInfo("title_type", title_type)}
            options={this.props.formStore.availableTitleTypes}
          />

          <Selection
            name="asset_type"
            value={this.props.formStore.assetInfo.asset_type}
            onChange={asset_type => this.props.formStore.UpdateAssetInfo("asset_type", asset_type)}
            options={this.props.formStore.availableAssetTypes}
          />

          <Input
            name="title"
            value={this.props.formStore.assetInfo.title}
            onChange={title => this.props.formStore.UpdateAssetInfo("title", title)}
          />

          <Input
            name="display_title"
            value={this.props.formStore.assetInfo.display_title}
            onChange={display_title => this.props.formStore.UpdateAssetInfo("display_title", display_title)}
          />

          { this.props.formStore.slugWarning ? <Warning message="Warning: Changing the slug will break any links to this object that contain the slug." /> : null }

          <Input
            name="slug"
            value={this.props.formStore.assetInfo.slug}
            onChange={slug => this.props.formStore.UpdateAssetInfo("slug", slug)}
          />

          <Input
            name="ip_title_id"
            label="IP Title ID"
            value={this.props.formStore.assetInfo.ip_title_id}
            onChange={ip_title_id => this.props.formStore.UpdateAssetInfo("ip_title_id", ip_title_id)}
          />

          { this.InfoFields() }
        </div>
      </div>
    );
  }
}

export default AssetInfo;
