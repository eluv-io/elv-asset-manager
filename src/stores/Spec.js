import {observable, action, flow, toJS} from "mobx";

// Incrementing unique IDs
let __id = 0;
class Id {
  static next(){
    __id++;
    return __id.toString();
  }
}

const FormatOptions = (options, sort=false) => {
  options = (options || [])
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .map(option => option.trim());

  if(sort) { options = options.sort(); }

  return options;
};

const Duplicates = (values) =>
  values
    .filter(value => value)
    .filter((value, index, self) => value && self.indexOf(value) !== index);

class SpecStore {
  @observable defaultSpec = {
    controls: [
      "images",
      "playlists"
    ],
    availableAssetTypes: [
      "primary",
      "clip"
    ],
    availableTitleTypes: [
      "collection",
      "episode",
      "season",
      "series",
      "site",
      "title"
    ],
    defaultImageKeys: [
      "portrait",
      "landscape"
    ],
    infoFields: [
      {name: "release_date", type: "date"},
      {name: "synopsis", type: "textarea"},
      {name: "copyright"},
      {name: "creator"},
      {name: "runtime", type: "integer"},
    ],
    localizations: [],
    fileControls: [],
    fileControlItems: {},
    associatedAssets: [
      {
        name: "titles",
        label: "Titles",
        indexed: true,
        slugged: true,
        defaultable: true,
        orderable: true
      },
      {
        name: "series",
        label: "Series",
        asset_types: ["primary"],
        title_types: ["series"],
        for_title_types: ["site", "collection"],
        indexed: true,
        slugged: true,
        defaultable: false,
        orderable: true
      },
      {
        name: "seasons",
        label: "Seasons",
        asset_types: ["primary"],
        title_types: ["season"],
        for_title_types: ["series"],
        indexed: true,
        slugged: true,
        defaultable: false,
        orderable: true
      },
      {
        name: "episodes",
        label: "Episodes",
        asset_types: ["primary"],
        title_types: ["episode"],
        for_title_types: ["season"],
        indexed: true,
        slugged: true,
        defaultable: false,
        orderable: true
      }
    ]
  };

  @observable controls = {};
  @observable fileControlItems = {};
  @observable availableAssetTypes = [];
  @observable availableTitleTypes = [];
  @observable defaultImageKeys = [];
  @observable associatedAssets = [];
  @observable infoFields = [];
  @observable infoFieldLocalizations = [];
  @observable localizations = [];

  @observable errors = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  InitializeSpec() {
    const config = this.rootStore.titleConfiguration;
    const defaults = this.defaultSpec;

    this.controls = {};
    (config.controls || defaults.controls).forEach(control => {
      if(typeof control === "string") {
        this.controls[control] = { name: control, simple: true };
      } else {
        const id = Id.next();
        this.controls[id] = {
          ...control,
          _id: id,
          link_key: control.link_key || control.linkKey
        };
      }
    });

    this.availableAssetTypes = config.asset_types || defaults.availableAssetTypes;
    this.availableTitleTypes = config.title_types || defaults.availableTitleTypes;
    this.infoFields = config.info_fields || defaults.infoFields;
    this.associatedAssets = config.associated_assets || defaults.associatedAssets;
    this.defaultImageKeys = config.default_image_keys || defaults.defaultImageKeys;

    this.localizations = this.FormatLocalizations(config.localization || defaults.localization);
  }

  FormatLocalizations(localizations) {
    if(!localizations) { return []; }

    let formattedLocales = [];
    Object.keys(localizations).forEach(key => {
      if(Array.isArray(localizations[key])) {
        // 2 level
        formattedLocales.push({
          key,
          depth: 2,
          options: localizations[key]
        });
      } else {
        // 3 level
        formattedLocales.push({
          key,
          depth: 3,
          options: Object.keys(localizations[key]).map(territory =>
            ({
              key: territory,
              options: localizations[key][territory]
            })
          )
        });
      }
    });

    return formattedLocales;
  }

  FormatInfoFields(fields, topLevel=false) {
    let infoFieldErrors = [];
    const formattedInfoFields = (fields || []).map(field => {
      let formattedField = {
        name: field.name,
        type: field.type || "text"
      };

      if(!field.name) {
        infoFieldErrors.push(`Info field ${field.label ? `'${field.label}' ` : ""}missing metadata key`);
      }

      if(field.label) {
        formattedField.label = field.label;
      }

      if(["select", "multiselect"].includes(field.type)) {
        formattedField.options = FormatOptions(field.options);
      }

      if(field.type === "file") {
        formattedField.extensions = FormatOptions(field.extensions);
      }

      if(topLevel && field.for_title_types) {
        formattedField.for_title_types = field.for_title_types;
      }

      if(topLevel && field.top_level) {
        formattedField.top_level = field.top_level;
      }

      if(field.type === "list" || field.type === "subsection") {
        const { infoFields, errors } = this.FormatInfoFields(field.fields);
        formattedField.fields = infoFields;

        infoFieldErrors = infoFieldErrors.concat(errors);
      }

      return formattedField;
    });

    Duplicates(formattedInfoFields.map(field => field.name))
      .forEach(duplicateName => infoFieldErrors.push(`Duplicate info field: ${duplicateName}`));

    return { infoFields: formattedInfoFields, errors: infoFieldErrors };
  }

  @action.bound
  SaveSpec = flow(function * ({commitMessage}) {
    let specErrors = [];
    try {
      const client = this.rootStore.client;

      const { infoFields, errors } = this.FormatInfoFields(toJS(this.infoFields), true);

      specErrors = errors;

      let titleConfiguration = {
        ...toJS(this.rootStore.titleConfiguration || {}),
        asset_types: toJS(FormatOptions(this.availableAssetTypes)),
        title_types: toJS(FormatOptions(this.availableTitleTypes)),
        associated_assets: toJS(this.associatedAssets),
        info_fields: toJS(infoFields),
        default_image_keys: toJS(FormatOptions(this.defaultImageKeys))
      };

      // Validation
      titleConfiguration.associated_assets.forEach(asset => {
        if(!asset.name) {
          specErrors.push(`Associated asset ${asset.label ? `'${asset.label}' ` : ""}missing metadata key`);
        }
      });

      Duplicates(titleConfiguration.associated_assets.map(field => field.name))
        .forEach(duplicateName => specErrors.push(`Duplicate associated asset: ${duplicateName}`));

      // Controls
      titleConfiguration.controls = Object.values(this.controls).map(control => {
        if(control.simple) {
          return control.name;
        }

        if(!control.name) {
          specErrors.push("File control missing name");
        }

        if(!control.link_key) {
          specErrors.push(`File control ${control.name ? `'${control.name}' ` : ""}missing link key`);
        }

        if(!control.target) {
          specErrors.push(`File control ${control.name ? `'${control.name}' ` : ""}missing link target`);
        }

        return {
          name: control.name,
          description: control.description || false,
          extensions: toJS(FormatOptions(control.extensions || [])),
          link_key: control.link_key,
          target: control.target,
          thumbnail: control.thumbnail || false,
          type: "files"
        };
      });

      Duplicates(titleConfiguration.controls.map(field => field.name))
        .forEach(duplicateName => specErrors.push(`Duplicate file control: ${duplicateName}`));
      Duplicates(titleConfiguration.controls.map(field => field.target))
        .forEach(duplicateName => specErrors.push(`Duplicate file control metadata target: ${duplicateName}`));

      // Localization
      titleConfiguration.localization = {};
      (this.localizations || []).forEach(({key, depth, options}) => {
        key = key.trim();

        if(!key) {
          specErrors.push("Localization option missing metadata key");
        }

        let formattedOptions = {};
        if(depth === 2) {
          formattedOptions = FormatOptions(options, true);
        } else {
          formattedOptions = {};
          options.forEach(option => {
            const optionKey = option.key.trim();

            if(!optionKey) {
              specErrors.push(`Localization option ${key ? `in '${key}' ` : ""}missing metadata key`);
            }

            formattedOptions[optionKey] = FormatOptions(option.options, true);
          });

          Duplicates(options.map(field => field.key))
            .forEach(duplicateName => specErrors.push(`Duplicate localization field for ${key}: ${duplicateName}`));
        }

        titleConfiguration.localization[key] = formattedOptions;
      });

      Duplicates((this.localizations || []).map(field => field.key))
        .forEach(duplicateName => specErrors.push(`Duplicate localization field: ${duplicateName}`));

      if(specErrors.length > 0) {
        throw Error(specErrors);
      }

      yield client.EditAndFinalizeContentObject({
        libraryId: (yield client.ContentSpaceId()).replace(/^ispc/, "ilib"),
        objectId: this.rootStore.typeId,
        commitMessage: commitMessage || "Asset Manager",
        callback: async ({writeToken}) => {
          await client.ReplaceMetadata({
            libraryId: (await client.ContentSpaceId()).replace(/^ispc/, "ilib"),
            objectId: this.rootStore.typeId,
            writeToken,
            metadataSubtree: "public/title_configuration",
            metadata: toJS(titleConfiguration)
          });
        }
      });

      client.SendMessage({options: {operation: "Reload"}});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);

      if(specErrors) {
        throw Error(FormatOptions(specErrors).join("\n"));
      } else {
        throw Error("Failed to update app configuration");
      }
    }
  });

  @action.bound
  ToggleSimpleControl(name) {
    if(this.controls[name]) {
      delete this.controls[name];
    } else {
      this.controls[name] = {
        name,
        simple: true
      };
    }
  }

  @action.bound
  UpdateControl({id, control}) {
    this.controls[id] = {
      _id: id,
      ...control
    };
  }

  @action.bound
  UpdateImageKeys(keys) {
    this.defaultImageKeys = keys;
  }

  @action.bound
  UpdateFileControls(updatedControls) {
    // Add ID to new controls
    updatedControls = updatedControls.map(control => {
      if(!control._id) {
        control._id = Id.next();
      }

      return control;
    });

    for(const control of updatedControls) {
      this.controls[control._id] = control;
    }

    Object.keys(this.controls).forEach(id => {
      if(!this.controls[id].simple && !updatedControls.find(control => control._id === id)) {
        delete this.controls[id];
      }
    });
  }

  @action.bound
  UpdateAssociatedAssets(associatedAssets) {
    this.associatedAssets = associatedAssets;
  }

  @action.bound
  UpdateAssetInfoFields(infoFields) {
    this.infoFields = infoFields;
  }

  @action.bound
  UpdateAssetTypes(types, operation) {
    if(operation === "remove") {
      // Remove deleted asset type from associated assets
      const removedType = this.availableAssetTypes.find(type => !types.includes(type));

      this.associatedAssets = this.associatedAssets.map(asset => {
        asset.asset_types = (asset.asset_types || []).filter(type => type !== removedType);

        return asset;
      });
    }

    this.availableAssetTypes = types;
  }

  @action.bound
  UpdateTitleTypes(types, operation) {
    if(operation === "remove") {
      // Remove deleted title type from associated assets
      const removedType = this.availableTitleTypes.find(type => !types.includes(type));

      this.associatedAssets = this.associatedAssets.map(asset => {
        asset.title_types = (asset.title_types || []).filter(type => type !== removedType);
        asset.for_title_types = (asset.for_title_types || []).filter(type => type !== removedType);

        return asset;
      });

      // Remove deleted title types from all 'for_title_types' directives
      this.infoFields = this.infoFields.map(infoField => {
        infoField.for_title_types = (infoField.for_title_types || []).filter(type => type !== removedType);

        return infoField;
      });
    }

    this.availableTitleTypes = types;
  }

  @action.bound
  UpdateLocalizations(localizations, operation) {
    if(operation !== "update") {
      this.localizations = localizations;
      return;
    }

    // If depth was changed, need to reconfigure options
    this.localizations = localizations.map((localization, index) => {
      const oldLocalization = (this.localizations || [])[index] || {};
      if((oldLocalization.depth || "").toString() !== (localization.depth || "").toString()) {
        // Save options for current depth and try and load options for new depth
        localization[`oldLocalization${oldLocalization.depth}Options`] = oldLocalization.options;

        if(localization[`oldLocalization${localization.depth}Options`]) {
          localization.options = localization[`oldLocalization${localization.depth}Options`];
        } else {
          localization.options = [];
        }
      }

      return localization;
    });
  }
}

export default SpecStore;
