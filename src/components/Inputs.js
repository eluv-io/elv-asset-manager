import React from "react";
import {runInAction, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import {
  Confirm,
  IconButton,
  Input,
  TextArea,
  Selection,
  MultiSelect,
  Checkbox,
  JsonInput,
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
import ObjectSelection from "./ObjectSelection";
import TextEditor from "./TextEditor";
import UpdateLinkIcon from "../static/icons/arrow-up-circle.svg";

export const ReferencePathElements = (PATH, reference) => {
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
    let value = field.default_value || "";
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
        value = field.default_value || 0;
        break;
      case "checkbox":
        value = field.default_value || false;
        break;
      case "select":
        value = field.default_value || field.options[0];
    }

    newValue[field.name] = field.default || newValue[field.name] || value;
  });

  return newValue;
};

@inject("rootStore")
@inject("contentStore")
@observer
class RecursiveField extends React.Component {
  InfoField({PATH="", field, entry, Update, localization={}, textAddButton=false}) {
    const hintLabel = field.hint ? HintLabel({label: field.label, name: field.name, hint: field.hint, required: field.required}) : null;

    const key = `input-${name}-${field.name}-${this.props.localizationKey}`;

    if(this.props.localizationKey && (field.no_localize || field.path)) { return null; }

    let fieldType = field.type;
    if(fieldType === "reference_type") {
      fieldType = (Utils.SafeTraverse(this.props.HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || "text");
    }

    if(fieldType === "textarea") {
      return (
        <TextArea
          key={key}
          name={field.name}
          label={hintLabel || field.label}
          value={entry[field.name] || ""}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else if(fieldType === "json") {
      return (
        <LabelledField key={key} label={hintLabel || field.label || FormatName(field.name)} className="json-labelled-field">
          <JsonInput
            key={key}
            name={field.name}
            value={entry[field.name] || ""}
            onChange={event => Update(field.name, event.target.value)}
          />
        </LabelledField>
      );
    } else if(fieldType === "rich_text") {
      return (
        <LabelledField key={key} label={hintLabel || field.label || FormatName(field.name)} className="text-editor-labelled-field">
          <TextEditor
            value={entry[field.name] || ""}
            onChange={newValue => Update(field.name, newValue)}
          />
        </LabelledField>
      );
    } else if(fieldType === "checkbox") {
      return (
        <Checkbox
          key={key}
          name={field.name}
          label={hintLabel || field.label}
          value={entry[field.name] || ""}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else if(fieldType === "date" || fieldType === "datetime") {
      return (
        <DateSelection
          key={key}
          name={field.name}
          label={hintLabel || field.label}
          value={entry[field.name]}
          dateOnly={fieldType === "date"}
          referenceTimezone={field.zone}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else if(fieldType === "uuid") {
      if(!entry[field.name]) {
        Update(field.name, Utils.B58(UUIDParse(UUID())));
      }

      return (
        <Input
          key={key}
          name={field.name}
          label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
          type={fieldType}
          value={entry[field.name] || ""}
          required={field.required}
          readonly
        />
      );
    } else if(fieldType === "self_embed_url") {
      let input =
        <Input
          key={key + "-input"}
          name={field.name}
          label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
          type={fieldType}
          value={entry[field.name] || ""}
          required={field.required}
          readonly
        />;

      if(field.version && !field.auto_update) {
        return (
          <div className="embed-url-field" key={key + entry[field.name]}>
            { input }
            <IconButton
              className="update-object-link"
              icon={UpdateLinkIcon}
              label="Update link"
              onClick={async () =>
                await Confirm({
                  message: `Are you sure you want to update '${field.name}'?`,
                  onConfirm: () => Update(field.name, this.props.rootStore.SelfEmbedUrl(field.version))
                })
              }
            />
          </div>
        );
      } else {
        return input;
      }
    } else if(fieldType === "select" || fieldType === "reference_select") {
      let options = localization.options || field.options;
      if(fieldType === "reference_select") {
        options = (Utils.SafeTraverse(this.props.HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || [])
          .map(option => [option[field.label_key], option[field.value_key]]);
      }

      return (
        <Selection
          key={key}
          name={field.name}
          label={hintLabel || field.label}
          value={entry[field.name]}
          options={options}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else if(fieldType === "multiselect" || fieldType === "reference_multiselect") {
      let options = localization.options || field.options;
      if(fieldType === "reference_multiselect") {
        options = (Utils.SafeTraverse(this.props.HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || [])
          .map(option => [option[field.label_key], option[field.value_key]]);
      }

      return (
        <MultiSelect
          key={key}
          name={field.label || FormatName(field.name)}
          label={hintLabel || field.label || FormatName(field.name)}
          values={entry[field.name] || []}
          options={options}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else if(fieldType === "ntp_id") {
      let options = [
        ...(this.props.ntps || []).map(({ntpId, name}) => [name, ntpId])
      ];

      const selected = (this.props.ntps || []).find(({ntpId}) => ntpId === entry[field.name]);

      options.push(["Other / None", ""]);

      return (
        <LabelledField label={hintLabel || field.label} key={key} className="ntp-selection-container">
          <div className="ntp-selection">
            {
              Maybe(
                options.length > 1,
                <select
                  name={field.name}
                  value={selected ? entry[field.name] : ""}
                  onChange={event => Update(field.name, event.target.value)}
                >
                  { options.map(([name, ntpId], i) => <option key={`option-${i}`} value={ntpId}>{ name }</option>)}
                </select>
              )
            }
            {
              Maybe(
                !selected,
                <input value={entry[field.name]} onChange={event => Update(field.name, event.target.value)} />
              )
            }
          </div>
        </LabelledField>
      );
    } else if(fieldType === "subsection" || fieldType === "reference_subsection") {
      if(typeof entry[field.name] !== "object") {
        Update(field.name, {});
      }

      let fields = field.fields;
      if(fieldType === "reference_subsection") {
        fields = (Utils.SafeTraverse(this.props.HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || [])
          .map(name => ({name, type: field.value_type || ""}));
      }

      return (
        <LabelledField
          key={key}
          className="list-field-container subsection-field-container"
          label={hintLabel || field.label || FormatName(field.name)}
        >
          <div className={`list-field subsection-field list-field-entry even ${field.tight ? "tight" : ""}`} title={field.label || FormatName(field.name)}>
            {
              fields.map(subField => (
                this.InfoField({
                  PATH: UrlJoin(PATH, field.name),
                  field: subField,
                  entry: entry[field.name],
                  Update: (_, newValue) => {
                    let newValues = toJS(entry[field.name]);

                    if(typeof newValues !== "object") {
                      newValues = {};
                    }

                    newValues[subField.name] = newValue;

                    Update(field.name, newValues);
                  },
                  textAddButton,
                })
              ))
            }
          </div>
        </LabelledField>
      );
    } else if(fieldType === "list" || fieldType === "reference_list") {
      let fields = field.fields;
      if(fieldType === "reference_list") {
        fields = field.fields || [];
        fields = fields.concat(Utils.SafeTraverse(this.props.HEAD || {}, ...(ReferencePathElements(PATH, field.reference))) || []);
      }

      return (
        this.ListField({
          PATH: UrlJoin(PATH, field.name),
          orderable: true,
          name: field.name,
          label: field.label,
          hint: field.hint,
          values: entry[field.name] || [],
          buttonText: field.buttonText,
          fields,
          Update: (name, newValues) => Update(field.name, newValues),
          textAddButton: {textAddButton}
        })
      );
    } else if(fieldType === "file" || fieldType === "file_url") {
      const { path, targetHash } = entry[field.name] || {};
      const extension = ((path || "").split(".").pop() || "").toLowerCase();
      const isImage = ["apng", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(extension);
      return (
        <LabelledField key={key} label={field.label || FormatName(field.name)}>
          <div className={`file-input ${path ? "" : "empty"}`}>
            {
              Maybe(
                path,
                <React.Fragment>
                  {
                    isImage ?
                      <PreviewIcon className="file-icon" imagePath={path} targetHash={targetHash}/> :
                      <ImageIcon className="file-icon" icon={FileIcon}/>
                  }
                  <div className="file-path" title={decodeURI(path)}>{ decodeURI(path) }</div>
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
              versionHash={targetHash}
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
                      onConfirm: async () => await Update(field.name, {...(entry[field.name] || {}), path: ""})
                    })
                  }
                />
              )
            }
          </div>
        </LabelledField>
      );
    } else if(fieldType === "color") {
      if(!(entry[field.name] || {}).color) {
        Update(field.name, {...(entry[field.name] || {label: ""}), color: "#000000"});
      }

      return (
        <LabelledField
          key={key}
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
            {
              field.no_label ? null :
                <input
                  className="color-label"
                  type="text"
                  placeholder="Color Label"
                  value={(entry[field.name] || {}).label || ""}
                  required={field.required}
                  onChange={event => Update(field.name, {
                    ...(entry[field.name] || {color: "", label: ""}),
                    label: event.target.value
                  })}
                />
            }
          </div>
        </LabelledField>
      );
    } else if(fieldType === "fabric_link") {
      return (
        <ObjectSelection
          key={key}
          label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
          browseHeader="Select Object"
          buttonText="Select Object"
          objectOnly={!field.version}
          offering={field.offering}
          videoPreview={field.video_preview}
          selectedObject={entry[field.name]}
          Select={ids => Update(field.name, ids)}
          Update={async () => {
            await Update(field.name, {
              ...entry[field.name],
              versionHash: await this.props.contentStore.LatestVersionHash(entry[field.name])
            });
          }}
          Remove={() => Update(field.name, undefined)}
        />
      );
    } else if(fieldType === "self_metadata_url") {
      return (
        <Input
          key={key}
          name={field.name}
          label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
          type={fieldType}
          value={(entry || {})[field.name] || ""}
          readonly={true}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    } else {
      return (
        <Input
          key={key}
          name={field.name}
          label={hintLabel || `${field.label || FormatName(field.name)} ${field.required ? "*" : ""}`}
          type={fieldType}
          value={(entry || {})[field.name] || ""}
          required={field.required}
          readonly={field.readonly}
          onChange={newValue => Update(field.name, newValue)}
        />
      );
    }
  }

  ListField({
    PATH="",
    name,
    label,
    values,
    buttonText,
    fields,
    defaultValue,
    hint,
    Update,
    orderable=false,
    prepend=false,
    textAddButton=false
  }) {
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
              this.InfoField({
                PATH: UrlJoin(PATH, index.toString()),
                field,
                entry: entry || {},
                Update: (entryName, newValue) => UpdateField(index, entryName, newValue),
                textAddButton
              })
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
              { Maybe(orderable && !this.props.localizationKey, <OrderButtons index={index} length={values.length} Swap={Swap} />) }
              {
                Maybe(
                  !this.props.localizationKey,
                  <IconButton
                    icon={DeleteIcon}
                    title={`Remove item from ${label || FormatName(name)}`}
                    onClick={async () => await Confirm({
                      message: "Are you sure you want to remove this item?",
                      onConfirm: () => Remove(index)
                    })}
                    className="info-list-icon info-list-remove-icon"
                  />
                )
              }
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

    if(textAddButton || buttonText) {
      addButton = (
        <Action
          title={buttonText || `Add ${label || name}`}
          onClick={Add}
          className="info-list-icon info-list-add-icon secondary"
        >
          { buttonText ? buttonText : `Add ${ label || FormatName(name) }` }
        </Action>
      );
    }

    return (
      <LabelledField
        key={`list-field-container-${name}`}
        className={`list-field-container ${!fields ? "array-list-container" : "field-list-container"}`}
        label={hint ? HintLabel({label, name, hint}) : label || FormatName(name)}
        formatLabel={false}
        value={
          <div className={`list-field ${!fields ? "array-list" : ""}`}>
            { fieldInputs }
            { this.props.localizationKey ? null : addButton }
          </div>
        }
      />
    );
  }

  render() {
    if(this.props.list) {
      return this.ListField({...this.props});
    } else {
      return this.InfoField({...this.props});
    }
  }
}

export {RecursiveField};
