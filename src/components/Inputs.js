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
  ToolTip,
  ImageIcon,
  FormatName
} from "elv-components-js";
import OrderButtons from "./OrderButtons";

import AddIcon from "../static/icons/plus-square.svg";
import DeleteIcon from "../static/icons/trash.svg";
import HintIcon from "../static/icons/help-circle.svg";

export const InfoField = ({field, entry, Update, localization={}}) => {
  if(field.hint) {
    field.hintLabel = HintLabel({label: field.label, name: field.name, hint: field.hint, required: field.required});
  }

  if(field.type === "textarea") {
    return (
      <TextArea
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.hintLabel || field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "checkbox") {
    return (
      <Checkbox
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.hintLabel || field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "date" || field.type === "datetime") {
    return (
      <DateSelection
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.hintLabel || field.label}
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
        label={field.hintLabel || field.label}
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
        label={field.hintLabel || field.label}
        values={entry[field.name] || []}
        options={localization.options || field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "list") {
    return (
      <ListField
        orderable
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.hintLabel || field.label}
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
        label={field.hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
        type={field.type}
        value={entry[field.name] || ""}
        required={field.required}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  }
};

const HintLabel = ({label, name, hint, required}) => {
  label = label || FormatName(name);

  return (
    <div className="hint-label">
      { label } { required ? "*" : "" }
      <ToolTip className="hint-tooltip" content={<pre className="hint-content">{ hint }</pre>}>
        <ImageIcon
          className="hint-icon"
          icon={HintIcon}
        />
      </ToolTip>
    </div>
  );
};

export const ListField = ({
  name,
  label,
  values,
  fields,
  defaultValue,
  hint,
  Update,
  orderable=false,
  prepend=false
}) => {
  if(fields && fields.length === 0) {
    fields = undefined;
  }

  values = values || [];

  const UpdateIndex = (index, newValue) => {
    let newValues = [...toJS(values)];
    newValues[index] = newValue;

    Update(name, newValues, "update");
  };

  const UpdateField = (index, fieldName, newValue) => {
    let newValues = [...toJS(values)];
    newValues[index] = toJS(newValues[index]);
    newValues[index][fieldName] = newValue;

    Update(name, newValues, "update");
  };

  const Add = () => {
    let newValues = [...toJS(values)];

    if(fields) {
      let newValue = defaultValue || {};
      fields.forEach(field => {
        newValue[field.name] = field.default || newValue[field.name] || "";
      });

      prepend ? newValues.unshift(newValue) : newValues.push(newValue);
    } else {
      prepend ? newValues.unshift("") : newValues.push("");
    }

    Update(name, newValues, "add");
  };

  const Remove = (index) => {
    let newValues = [...toJS(values)];

    newValues = newValues.filter((_, i) => i !== index);

    Update(name, newValues, "remove");
  };

  const Swap = (i1, i2) => {
    let newValues = [...toJS(values)];
    const temp = newValues[i1];
    newValues[i1] = newValues[i2];
    newValues[i2] = temp;

    Update(name, newValues, "swap");
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
              field={field}
              entry={entry || {}}
              Update={(entryName, newValue) => UpdateField(index, entryName, newValue)}
            />
          );
        });
      } else {
        entryFields = <input key={`entry-field-${index}`} value={entry || ""} onChange={event => UpdateIndex(index, event.target.value)} />;
      }

      return (
        <div
          className={`list-field-entry ${index % 2 === 0 ? "even" : "odd"}`}
          key={`input-container-${name}-${index}`}
        >
          <div className="actions">
            {Maybe(orderable, <OrderButtons index={index} length={values.length} Swap={Swap} />)}
            <IconButton
              icon={DeleteIcon}
              title="Remove Item"
              onClick={async () => await Confirm({
                message: "Are you sure you want to remove this item?",
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
      className="list-field-container"
      label={hint ? HintLabel({label, name, hint}) : label || FormatName(name)}
      formatLabel={false}
      value={
        <div className={`list-field ${!fields ? "array-list" : ""}`}>
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
