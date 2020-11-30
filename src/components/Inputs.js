import React from "react";
import {toJS} from "mobx";
import {
  Confirm,
  IconButton,
  Input,
  TextArea,
  Selection,
  MultiSelect,
  Checkbox,
  LabelledField,
  DateSelection,
  Maybe,
} from "elv-components-js";

import AddIcon from "../static/icons/plus-square.svg";
import DeleteIcon from "../static/icons/trash.svg";
import OrderButtons from "./OrderButtons";

export const InfoField = ({field, entry, Update, localization={}}) => {
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
        options={localization.options || field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "multiselect") {
    return (
      <MultiSelect
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        values={entry[field.name] || []}
        options={localization.options || field.options}
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
        Update={(name, newValues) => Update(field.name, newValues)}
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

export const ListField = ({name, label, values, fields, Update, orderable=false, prepend=false}) => {
  values = values || [];

  const UpdateIndex = (index, newValue) => {
    let newValues = [...toJS(values)];
    newValues[index] = newValue;

    Update(name, newValues);
  };

  const UpdateField = (index, fieldName, newValue) => {
    let newValues = [...toJS(values)];
    newValues[index] = toJS(newValues[index]);
    newValues[index][fieldName] = newValue;

    Update(name, newValues);
  };

  const Add = () => {
    let newValues = [...toJS(values)];

    if(fields) {
      let newValue = {};
      fields.forEach(field => {
        newValue[field.name] = field.default || "";
      });

      prepend ? newValues.unshift(newValue) : newValues.push(newValue);
    } else {
      prepend ? newValues.unshift("") : newValues.push("");
    }

    Update(name, newValues);
  };

  const Remove = (index) => {
    let newValues = [...toJS(values)];

    newValues = newValues.filter((_, i) => i !== index);

    Update(name, newValues);
  };

  const Swap = (i1, i2) => {
    let newValues = [...toJS(values)];
    const temp = newValues[i1];
    newValues[i1] = newValues[i2];
    newValues[i2] = temp;

    Update(name, newValues);
  };

  const fieldInputs =
    (values || []).map((entry, index) => {
      let entryFields;
      if(fields) {
        entryFields = fields.map(field => {
          if(field.only && !field.only(entry)) {
            return null;
          }

          if(field.render) {
            return field.render(index);
          }

          return (
            <InfoField
              key={`entry-field-${index}-${field.name}`}
              field={field} entry={entry || {}}
              Update={(entryName, newValue) => UpdateField(index, entryName, newValue)}
            />
          );
        });
      } else {
        entryFields = <input key={`entry-field-${index}`} value={entry || ""} onChange={event => UpdateIndex(index, event.target.value)} />;
      }

      return (
        <div
          className={`asset-info-list-field-entry ${index % 2 === 0 ? "even" : "odd"}`}
          key={`input-container-${name}-${index}`}
        >
          <div className="actions">
            {Maybe(orderable, <OrderButtons index={index} length={values.length} Swap={Swap} />)}
            <IconButton
              icon={DeleteIcon}
              title={`Remove ${label || name}`}
              onClick={async () => await Confirm({
                message: `Are you sure you want to remove this entry from ${label || name}?`,
                onConfirm: () => Remove(index)
              })}
              className="info-list-icon info-list-remove-icon"
            />
          </div>
          { entryFields }
        </div>
      );
    });

  return (
    <LabelledField
      className="list-field"
      label={label || name}
      formatLabel={!label}
      value={
        <div className={`asset-info-list-field ${!fields ? "array-list" : ""}`}>
          { fieldInputs }
          <IconButton
            icon={AddIcon}
            title={`Add ${label || name}`}
            onClick={Add}
            className="info-list-icon info-list-add-icon"
          />
        </div>
      }
    />
  );
};
