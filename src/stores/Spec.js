import {observable, action, flow, toJS} from "mobx";

import DefaultSpec from "@eluvio/elv-client-js/typeSpecs/Default";

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
  @observable profile;
  @observable associatePermissions = false;
  @observable playable = false;
  @observable hideImageTab = false;
  @observable displayApp = "";
  @observable manageApp = "";
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
  InitializeSpec(profile) {
    const config = profile || this.rootStore.titleConfiguration;

    this.profile = profile ? profile.profile || { name: profile.name, version: profile.version } : config.profile;

    this.controls = {};
    (config.controls || DefaultSpec.controls).forEach(control => {
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

    this.associatePermissions = config.associate_permissions || false;
    this.playable = config.playable || false;
    this.hideImageTab = config.hide_image_tab || config.hideImageTab || false;
    this.displayApp = config.display_app || config.displayApp || "";
    this.manageApp = config.manage_app || config.manageApp || "";
    this.availableAssetTypes = config.asset_types || config.availableAssetTypes || DefaultSpec.asset_types;
    this.availableTitleTypes = config.title_types || config.availableTitleTypes || DefaultSpec.title_types;
    this.infoFields = config.info_fields || config.infoFields || DefaultSpec.info_fields;
    this.associatedAssets = config.associated_assets || config.associatedAssets || DefaultSpec.associated_assets;
    this.defaultImageKeys = config.default_image_keys || config.defaultImageKeys || DefaultSpec.default_image_keys;

    this.localizations = this.FormatLocalizations(config.localization || DefaultSpec.localization);
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

      if(field.no_localize) {
        formattedField.no_localize = true;
      }

      if(field.hint) {
        formattedField.hint = field.hint;
      }

      if(field.default_value) {
        formattedField.default_value = field.default_value;
      }

      if(field.readonly) {
        formattedField.readonly = true;
      }

      if(field.path) {
        formattedField.path = field.path;
      }

      if(["select", "multiselect"].includes(field.type)) {
        formattedField.options = FormatOptions(field.options);
      }

      if(field.type === "file" || field.type === "file_url") {
        formattedField.extensions = FormatOptions(field.extensions);
      }

      if(["fabric_link"].includes(field.type)) {
        formattedField.video_preview = !!field.video_preview;
        formattedField.hash_only = !!field.hash_only;
      }

      if(["fabric_link", "self_embed_url", "embed_url"].includes(field.type)) {
        formattedField.version = !!field.version;
      }

      if(["self_embed_url", "embed_url"].includes(field.type)) {
        formattedField.auto_update = !!field.auto_update;

        formattedField.loop = !!field.loop;
        formattedField.autoplay = !!field.autoplay;
        formattedField.hide_controls = !!field.hide_controls;
        formattedField.muted = !!field.muted;
      }

      if(["reference_subsection", "reference_list", "reference_type", "reference_select", "reference_multiselect"].includes(field.type)) {
        if(!field.reference) {
          infoFieldErrors.push(`${field.name} is missing a reference`);
        }

        formattedField.reference = field.reference;
        formattedField.value_type = field.value_type;
      }

      if(["reference_select", "reference_multiselect"].includes(field.type)) {
        formattedField.label_key = field.label_key;
        formattedField.value_key = field.value_key;
        formattedField.allow_null = field.allow_null;
      }

      if(field.type === "color") {
        formattedField.no_label = field.no_label;
      }

      if(topLevel && field.for_title_types && field.for_title_types.length > 0) {
        formattedField.for_title_types = field.for_title_types;
      }

      if(topLevel && field.top_level) {
        formattedField.top_level = field.top_level;
      }

      if(["list", "subsection", "reference_list", "reference_subsection"].includes(field.type)) {
        const { infoFields, errors } = this.FormatInfoFields(field.fields);
        formattedField.fields = infoFields;

        infoFieldErrors = infoFieldErrors.concat(errors);

        if(field.tight) {
          formattedField.tight = true;
        }
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
        associate_permissions: this.associatePermissions,
        hide_image_tab: this.hideImageTab,
        playable: this.playable,
        display_app: this.display_app,
        manage_app: this.manage_app,
        profile: toJS(this.profile),
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

      const libraryId = (yield client.ContentSpaceId()).replace(/^ispc/, "ilib");
      yield client.EditAndFinalizeContentObject({
        libraryId,
        objectId: this.rootStore.typeId,
        commitMessage: commitMessage || "Asset Manager",
        callback: async ({writeToken}) => {
          await client.ReplaceMetadata({
            libraryId,
            objectId: this.rootStore.typeId,
            writeToken,
            metadataSubtree: "public/title_configuration",
            metadata: toJS(titleConfiguration)
          });

          if(this.playable) {
            await client.MergeMetadata({
              libraryId,
              objectId: this.rootStore.typeId,
              writeToken,
              metadata: {
                "bitcode_flags": "abrmaster",
                "bitcode_format": "builtin"
              }
            });
          }

          await client.MergeMetadata({
            libraryId,
            objectId: this.rootStore.typeId,
            writeToken,
            metadataSubtree: "public",
            metadata: {
              "eluv.displayApp": this.displayApp,
              "eluv.manageApp": this.manageApp
            }
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
  TogglePermissionAssociation(enabled) {
    this.associatePermissions = enabled;
  }

  @action.bound
  TogglePlayable(enabled) {
    this.playable = enabled;
  }

  @action.bound
  ToggleImageTabHidden(hidden) {
    this.hideImageTab = hidden;
  }

  @action.bound
  UpdateApp(type, app) {
    this[`${type}App`] = app;
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
