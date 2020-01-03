import React from "react";

export const Input = ({label, name, value, readonly=false, onChange}) => {
  return (
    <div className="asset-form-input">
      <label htmlFor={name}>{label || name}</label>
      <input
        name={name}
        value={value}
        readOnly={readonly}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
};

export const TextArea = ({label, name, value, onChange}) => {
  return (
    <div className="asset-form-input">
      <label htmlFor={name}>{label || name}</label>
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
      <label htmlFor={name}>{label || name}</label>
      <select
        name={name}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {options.map(option =>
          <option value={option} key={`asset-info-${name}-${option}`}>{option}</option>
        )}
      </select>
    </div>
  );
};
