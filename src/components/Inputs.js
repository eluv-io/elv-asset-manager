import "react-datetime/css/react-datetime.css";
require("moment-timezone");

import React, {useState} from "react";
import {toJS} from "mobx";
import {Action, BrowseWidget, IconButton} from "elv-components-js";
import {Settings} from "luxon";
import AddIcon from "../static/icons/plus-square.svg";
import RemoveIcon from "../static/icons/trash.svg";
import * as DatePicker from "react-datetime";

const FormatName = (name) => {
  return (name || "")
    .split(/[_, \s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const Maybe = (value, component) => value ?
  (typeof component === "function" ? component() : component) :
  null;

export const Warning = ({message}) => {
  return (
    <div className="asset-form-input asset-form-input-warning">
      <label />
      <div className="warning">{ message }</div>
    </div>
  );
};

export const Input = ({type, label, name, value, readonly=false, onChange, hidden=false, required=false}) => {
  if(hidden) { return null; }

  return (
    <div className="asset-form-input">
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <input
        required={required}
        name={name}
        value={value}
        readOnly={readonly}
        onChange={event => {
          let input = event.target.value.toString();

          if(type === "integer") {
            input = input.replace(/[^0-9]/g, "");
          } else if(type === "number") {
            input = input.replace(/[^0-9.]/g, "").replace(/\.{2,}/g, ".");
          }

          onChange(input);
        }}
      />
    </div>
  );
};

export const Checkbox = ({label, name, value, readonly=false, onChange}) => {
  return (
    <div className="asset-form-input">
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <div className="checkbox-container">
        <input
          name={name}
          type="checkbox"
          checked={!!value}
          readOnly={readonly}
          onChange={event => {
            onChange(event.target.checked);
          }}
        />
      </div>
    </div>
  );
};

export const TextArea = ({label, name, value, onChange}) => {
  return (
    <div className="asset-form-input asset-form-textarea">
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <textarea
        name={name}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
};

export const Selection = ({label, name, value, onChange, options}) => {
  return (
    <div className="asset-form-input">
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <select
        name={name}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {options.map(option => {
          let name = option;
          let value = option;
          if(Array.isArray(option)) {
            name = option[0];
            value = option[1];
          }

          return <option value={value} key={`asset-info-${name}-${value}`}>{name}</option>;
        })}
      </select>
    </div>
  );
};

export const MultiSelect = ({label, name, values, onChange, options}) => {
  const Update = (index, event) => {
    let newValues = [...toJS(values)];
    newValues[index] = event.target.value;

    onChange(newValues);
  };

  const Add = () => {
    let newValues = [...toJS(values)];
    newValues.push(options[0]);

    onChange(newValues);
  };

  const Remove = (index) => {
    let newValues = [...toJS(values)];

    newValues =
      newValues.filter((_, i) => i !== index);

    onChange(newValues);
  };

  return (
    <div className="asset-form-input asset-form-multi-select">
      <label htmlFor={name}>
        {label || FormatName(name)}
      </label>
      <div>
        <IconButton
          icon={AddIcon}
          label={`Add ${name}`}
          onClick={() => Add()}
          className="asset-form-multi-select-add"
        />
        {(values || []).map((selected, index) =>
          <div className="asset-form-multi-select-selections" key={`asset-form-multi-select-${name}-${index}`}>
            <select
              name={name}
              value={selected}
              onChange={event => Update(index, event)}
            >
              {options.map(option  =>
                <option value={option} key={`asset-form-${name}-${option}-${index}`}>{option}</option>
              )}
            </select>

            <IconButton
              icon={RemoveIcon}
              label={`Remove ${name}`}
              onClick={() => Remove(index)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const DateSelection = ({
  label,
  name,
  value,
  dateOnly=false,
  onChange,
  referenceTimezone,
  useDefaultReferenceTimezone=true
}) => {
  let debounceTimeout;
  return (
    <div className="asset-form-input asset-form-date">
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <DatePicker
        value={value}
        input
        strictParsing
        timeFormat={dateOnly ? false : "HH:mm:ss z (Z)"}
        dateFormat={"YYYY-MM-DD"}
        displayTimeZone={referenceTimezone || (useDefaultReferenceTimezone ? Settings.defaultZoneName || "" : "")}
        onChange={datetime => {
          if(parseInt(datetime.valueOf()) === datetime.valueOf()) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => onChange(datetime.valueOf()), 500);
          }
        }}
      />
    </div>
  );
};

export const ToggleSection = ({sectionName, showInitially=false, children}) => {
  const [show, setShow] = useState(showInitially);

  const toggleButton = (
    <Action className="toggle-section-button secondary" onClick={() => setShow(!show)}>
      { show ? `Hide ${sectionName}` : `Show ${sectionName}`}
    </Action>
  );

  return (
    <div className={`toggle-section toggle-section-${show ? "show" : "hide"}`}>
      { toggleButton }

      { show ? <div className="toggle-section-content">{ children }</div> : null }
    </div>
  );
};

export const FileBrowser = ({name, header, accept, multiple=false, directories=false, onChange}) => {
  return (
    <div className="asset-form-input asset-form-file-browser">
      <label htmlFor="schedule">Upload schedule from file</label>
      <BrowseWidget
        name={name}
        header={header}
        accept={accept}
        multiple={multiple}
        directories={directories}
        onChange={onChange}
      />
    </div>
  );
};

export const LabelledField = ({label, value, hidden=false, formatLabel=false, children}) => {
  if(hidden) { return null; }

  return (
    <div className="asset-form-input asset-form-labelled-field">
      <label>{ formatLabel ? FormatName(label) : label }</label>
      <div title={value}>{ children || value }</div>
    </div>
  );
};
