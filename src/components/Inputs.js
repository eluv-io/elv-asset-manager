import React from "react";
import {runInAction, toJS} from "mobx";
import {observer} from "mobx-react";
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
  FormatName,
  Action
} from "elv-components-js";
import OrderButtons from "./OrderButtons";
import FileSelection from "./FileBrowser";
import PreviewIcon from "./PreviewIcon";
import Utils from "@eluvio/elv-client-js/src/Utils";
import UrlJoin from "url-join";
import {v4 as UUID, parse as UUIDParse} from "uuid";

import AddIcon from "../static/icons/plus-square.svg";
import DeleteIcon from "../static/icons/trash.svg";
import HintIcon from "../static/icons/help-circle.svg";
import FileIcon from "../static/icons/file.svg";

const ReferencePathElements = (PATH, reference) => {
  let pathElements;
  if(reference.startsWith("/")) {
    pathElements = reference.split("/");
  } else {
    pathElements = PATH.split("/");

    reference.split("/").forEach(element => {
      if(element === ".") {
        // No action
      } else if(element === "..") {
        pathElements = pathElements.slice(0, -1);
      } else {
        pathElements.push(element);
      }
    });
  }

  return pathElements.filter(e => e);
};

let InfoField = ({HEAD, PATH="", field, entry, Update, localization={}, textAddButton=false}) => {
  const hintLabel = field.hint ? HintLabel({label: field.label, name: field.name, hint: field.hint, required: field.required}) : null;

  if(field.type === "textarea") {
    return (
      <TextArea
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "checkbox") {
    return (
      <Checkbox
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || field.label}
        value={entry[field.name] || ""}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "date" || field.type === "datetime") {
    return (
      <DateSelection
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || field.label}
        value={entry[field.name]}
        dateOnly={field.type === "date"}
        referenceTimezone={field.zone}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "uuid") {
    if(!entry[field.name]) {
      Update(field.name, Utils.B58(UUIDParse(UUID())));
    }

    return (
      <Input
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
        type={field.type}
        value={entry[field.name] || ""}
        required={field.required}
        readonly
      />
    );
  } else if(field.type === "select") {
    return (
      <Selection
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || field.label}
        value={entry[field.name]}
        options={localization.options || field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "multiselect") {
    return (
      <MultiSelect
        key={`input-${name}-${field.name}`}
        name={field.label || FormatName(field.name)}
        label={hintLabel || field.label || FormatName(field.name)}
        values={entry[field.name] || []}
        options={localization.options || field.options}
        onChange={newValue => Update(field.name, newValue)}
      />
    );
  } else if(field.type === "subsection" || field.type === "reference_subsection") {
    if(typeof entry[field.name] !== "object") {
      Update(field.name, {});
    }

    let fields = field.fields;
    if(field.type === "reference_subsection") {
      fields = (Utils.SafeTraverse(HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || [])
        .map(name => ({name, type: field.value_type || ""}));
    }

    return (
      <LabelledField
        className="list-field-container subsection-field-container"
        label={hintLabel || field.label || FormatName(field.name)}
        key={`input-${name}-${field.name}`}
      >
        <div className={`list-field subsection-field list-field-entry even ${field.tight ? "tight" : ""}`} title={field.label || FormatName(field.name)}>
          {
            fields.map((subField, index) => (
              <InfoField
                HEAD={HEAD}
                PATH={UrlJoin(PATH, field.name)}
                key={`input-${name}-${field.name}-${subField.name}-${index}`}
                field={subField}
                entry={entry[field.name]}
                Update={(_, newValue) => {
                  let newValues = toJS(entry[field.name]);

                  if(typeof newValues !== "object") {
                    newValues = {};
                  }

                  newValues[subField.name] = newValue;

                  Update(field.name, newValues);
                }}
                textAddButton={textAddButton}
              />
            ))
          }
        </div>
      </LabelledField>
    );
  } else if(field.type === "list" || field.type === "reference_list") {
    let fields = field.fields;
    if(field.type === "reference_list") {
      fields = (Utils.SafeTraverse(HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || []);
    }

    return (
      <ListField
        HEAD={HEAD}
        PATH={UrlJoin(PATH, field.name)}
        orderable
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={field.label}
        hint={field.hint}
        values={entry[field.name] || []}
        fields={fields}
        Update={(name, newValues) => Update(field.name, newValues)}
        textAddButton={textAddButton}
      />
    );
  } else if(field.type === "file") {
    const path = entry[field.name].path || "";
    const extension = ((path || "").split(".").pop() || "").toLowerCase();
    const isImage = ["apng", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(extension);

    return (
      <LabelledField key={`input-${name}-${field.name}`} label={field.label || FormatName(field.name)}>
        <div className={`file-input ${path ? "" : "empty"}`}>
          {
            Maybe(
              path,
              <React.Fragment>
                {
                  isImage ?
                    <PreviewIcon className="file-icon" imagePath={path} targetHash={entry[field.name].targetHash}/> :
                    <ImageIcon className="file-icon" icon={FileIcon}/>
                }
                <div className="file-path" title={path}>{ path }</div>
              </React.Fragment>
            )
          }
          {
            Maybe(
              !path,
              <div className="file-path empty">{ "<No File Selected>" }</div>
            )
          }
          <FileSelection
            header={`Select an item for '${field.label || field.name}'`}
            versionHash={entry[field.name].targetHash}
            extensions={field.extensions}
            Select={({path, targetHash}) => Update(field.name, { path, targetHash })}
          />
          {
            Maybe(
              path,
              <IconButton
                icon={DeleteIcon}
                onClick={() =>
                  Confirm({
                    message: "Are you sure you want to remove this file?",
                    onConfirm: async () => await Update(field.name, {...entry[field.name], path: ""})
                  })
                }
              />
            )
          }
        </div>
      </LabelledField>
    );
  } else if(field.type === "color") {
    if(!(entry[field.name] || {}).color) {
      Update(field.name, {...(entry[field.name] || {label: ""}), color: "#000000"});
    }

    return (
      <LabelledField
        key={`input-${name}-${field.name}`}
        label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
      >
        <div className="color-field">
          <input
            className="color-input"
            type="color"
            value={(entry[field.name] || {}).color || ""}
            required={field.required}
            onChange={event => Update(field.name, {...(entry[field.name] || {color: "", label: ""}), color: event.target.value})}
          />
          <input
            className="color-label"
            type="text"
            placeholder="Color Label"
            value={(entry[field.name] || {}).label || ""}
            required={field.required}
            onChange={event => Update(field.name, {...(entry[field.name] || {color: "", label: ""}), label: event.target.value})}
          />
        </div>
      </LabelledField>
    );
  } else {
    return (
      <Input
        key={`input-${name}-${field.name}`}
        name={field.name}
        label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
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
      <div className="hint-label-text">
        { label } { required ? "*" : "" }
      </div>
      <ToolTip className="hint-tooltip" content={<pre className="hint-content">{ hint }</pre>}>
        <ImageIcon
          className="hint-icon"
          icon={HintIcon}
        />
      </ToolTip>
    </div>
  );
};

const InitializeField = ({fields, defaultValue}) => {
  let newValue = defaultValue || {};

  fields.forEach(field => {
    let value = "";
    switch (field.type) {
      case "subsection":
        value = InitializeField({fields: field.fields});
        break;
      case "list":
      case "multiselect":
        value = [];
        break;
      case "number":
      case "integer":
        value = 0;
        break;
      case "checkbox":
        value = false;
        break;
      case "select":
        value = field.options[0];
    }

    newValue[field.name] = field.default || newValue[field.name] || value;
  });

  return newValue;
};

let ListField = ({
  HEAD,
  PATH="",
  name,
  label,
  values,
  fields,
  defaultValue,
  hint,
  Update,
  orderable=false,
  prepend=false,
  textAddButton=false
}) => {
  if(fields && fields.length === 0) {
    fields = undefined;
  }

  values = values || [];

  const UpdateIndex = (index, newValue) => {
    // Allow list fields to directly modify observed values for efficiency
    runInAction(() => values[index] = newValue);
  };

  const UpdateField = (index, fieldName, newValue) => {
    runInAction(() => values[index][fieldName] = newValue);
  };

  const Add = () => {
    let newValues = [...toJS(values)];

    if(fields) {
      const newValue = InitializeField({fields, defaultValue});

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
              HEAD={HEAD}
              PATH={UrlJoin(PATH, index.toString())}
              key={`entry-field-${index}-${field.name}`}
              field={field}
              entry={entry || {}}
              Update={(entryName, newValue) => UpdateField(index, entryName, newValue)}
              textAddButton={textAddButton}
            />
          );
        });
      } else {
        entryFields = <input key={`entry-field-${index}`} value={entry || ""} onChange={event => UpdateIndex(index, event.target.value)} />;
      }

      return (
        <div
          className={`list-field-entry ${index % 2 === 0 ? "even" : "odd"}`}
          title={label || FormatName(name)}
          key={`input-container-${name}-${index}`}
        >
          <div className="actions">
            {Maybe(orderable, <OrderButtons index={index} length={values.length} Swap={Swap} />)}
            <IconButton
              icon={DeleteIcon}
              title={`Remove item from ${label || FormatName(name)}`}
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

  let addButton = (
    <IconButton
      icon={AddIcon}
      title={`Add ${label || name}`}
      onClick={Add}
      className="info-list-icon info-list-add-icon secondary"
    />
  );

  if(textAddButton) {
    addButton = (
      <Action
        title={`Add ${label || name}`}
        onClick={Add}
        className="info-list-icon info-list-add-icon secondary"
      >
        Add { label || FormatName(name) }
      </Action>
    );
  }

  return (
    <LabelledField
      className={`list-field-container ${!fields ? "array-list-container" : "field-list-container"}`}
      label={hint ? HintLabel({label, name, hint}) : label || FormatName(name)}
      formatLabel={false}
      value={
        <div className={`list-field ${!fields ? "array-list" : ""}`}>
          { fieldInputs }
          { addButton }
        </div>
      }
    />
  );
};

InfoField = observer(InfoField);
ListField = observer(ListField);

export {InfoField, ListField};
