import React from "react";
import {inject, observer} from "mobx-react";
import {Input, TextArea, Selection, Date, MultiSelect, Checkbox, LabelledField} from "./Inputs";
import {Confirm, IconButton} from "elv-components-js";
import {toJS} from "mobx";

import AddIcon from "../static/icons/plus-square.svg";
import DeleteIcon from "../static/icons/trash.svg";

const GENRES = [
  "Action / Adventure",
  "Action",
  "Adult",
  "Adventure",
  "Animation",
  "Awards Show",
  "Beauty Pageant",
  "Biblical",
  "Biography",
  "Black Exploitation (ORION)",
  "Business",
  "Childrens",
  "Classic",
  "Comedy",
  "Comedy / Drama",
  "Comedy / Adventure",
  "Comic Fantasy",
  "Coming of Age",
  "Competition",
  "Comedy / Romance",
  "Crime",
  "Dance",
  "Documentary",
  "DocuDrama",
  "Dramatic Comedy",
  "Drama",
  "Erotic",
  "Espionage",
  "Family",
  "Fantasy",
  "Game Show",
  "Historical",
  "Holiday",
  "Horror",
  "Instructional",
  "LGBTQ",
  "Live Event",
  "Magazine Format",
  "Magic Show",
  "Thriller",
  "Mystery",
  "Musical",
  "Noir",
  "Performance",
  "Reality",
  "Religious",
  "Romance",
  "Romantic Comedy",
  "Romantic Drama",
  "Sci-Fi/Adventure",
  "Sci-Fi",
  "Sci-Fi/Horror",
  "Sci-Fi/Thriller",
  "Sports",
  "Suspense",
  "War",
  "Western"
];

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
    values.map((entry, index) => {
      entry = entry || {};

      const entryFields = fields.map(field => {
        if(field.type === "textarea") {
          return (
            <TextArea
              key={`input-${name}-${field.name}`}
              name={field.name}
              label={field.label}
              value={entry[field.name] || ""}
              onChange={newValue => Update(index, field.name, newValue)}
            />
          );
        } else if(field.type === "checkbox") {
          return (
            <Checkbox
              key={`input-${name}-${field.name}`}
              name={field.name}
              label={field.label}
              value={entry[field.name] || ""}
              onChange={newValue => Update(index, field.name, newValue)}
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
              onChange={newValue => Update(index, field.name, newValue)}
            />
          );
        }
      });

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

    return fields.map(({name, label, type, fields}) => {
      if(type === "textarea") {
        return (
          <TextArea
            key={`input-${name}`}
            name={name}
            label={label}
            value={this.props.formStore.assetInfo[name]}
            onChange={value => this.props.formStore.UpdateAssetInfo(name, value)}
          />
        );
      } else if(type === "checkbox") {
        return (
          <Checkbox
            key={`input-${name}`}
            name={name}
            label={label}
            value={this.props.formStore.assetInfo[name]}
            onChange={value => this.props.formStore.UpdateAssetInfo(name, value)}
          />
        );
      } else if(type === "list") {
        return (
          <ListField
            key={`input-${name}`}
            name={name}
            values={this.props.formStore.assetInfo[name]}
            fields={fields}
            UpdateAssetInfo={this.props.formStore.UpdateAssetInfo}
          />
        );
      } else {
        return (
          <Input
            key={`input-${name}`}
            name={name}
            label={label}
            type={type}
            value={this.props.formStore.assetInfo[name]}
            onChange={value => this.props.formStore.UpdateAssetInfo(name, value)}
          />
        );
      }
    });
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

          <Date
            name="release_date"
            year={this.props.formStore.assetInfo.release_date.year}
            month={this.props.formStore.assetInfo.release_date.month}
            day={this.props.formStore.assetInfo.release_date.day}
            onChange={release_date => this.props.formStore.UpdateAssetInfo("release_date", release_date)}
          />

          <MultiSelect
            name="genre"
            values={this.props.formStore.assetInfo.genre}
            onChange={genre => this.props.formStore.UpdateAssetInfo("genre", genre)}
            options={GENRES}
          />

          { this.InfoFields() }
        </div>
      </div>
    );
  }
}

export default AssetInfo;
