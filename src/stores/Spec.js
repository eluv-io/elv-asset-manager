import {observable, action, flow, toJS} from "mobx";

let __id = 0;
class Id {
  static next(){
    __id++;
    return __id.toString();
  }
}

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
    infoFieldLocalizations: {},
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
  @observable infoFieldLocalizations = {};

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
    this.infoFieldLocalizations = config.info_field_localizations;
    this.associatedAssets = config.associated_assets || defaults.associatedAssets;
    this.defaultImageKeys = config.default_image_keys || defaults.defaultImageKeys;

    this.localization = config.localization;
  }

  FormatInfoFields(fields, topLevel=false) {
    return fields.map(field => {
      let formattedField = {
        name: field.name,
        type: field.type || "text"
      };

      if(field.label) {
        formattedField.label = field.label;
      }

      if(["select", "multiselect"].includes(field.type)) {
        formattedField.options = field.options;
      }

      if(topLevel && field.for_title_types) {
        formattedField.for_title_types = field.for_title_types;
      }

      if(field.type === "list") {
        formattedField.fields = this.FormatInfoFields(field.fields);
      }

      return formattedField;
    });
  }

  @action.bound
  SaveSpec = flow(function * ({commitMessage}) {
    try {
      const client = this.rootStore.client;

      const infoFields = this.FormatInfoFields(toJS(this.infoFields), true);

      let titleConfiguration = {
        ...toJS(this.rootStore.titleConfiguration || {}),
        asset_types: toJS(this.availableAssetTypes),
        title_types: toJS(this.availableTitleTypes),
        associated_assets: toJS(this.associatedAssets),
        info_fields: toJS(infoFields),
        default_image_keys: toJS(this.defaultImageKeys)
      };

      /*
    {
        "description": true,
        "extensions": [
          "apng",
          "gif",
          "jpg",
          "jpeg",
          "png",
          "svg",
          "tif",
          "tiff",
          "webp"
        ],
        "linkKey": "image",
        "name": "Gallery",
        "target": "/public/asset_metadata/gallery",
        "thumbnail": true,
        "type": "files"
      }
 */

      titleConfiguration.controls = Object.values(this.controls).map(control => {
        if(control.simple) {
          return control.name;
        }

        return {
          name: control.name,
          description: control.description || false,
          extensions: toJS(control.extensions),
          link_key: control.link_key,
          target: control.target,
          thumbnail: control.thumbnail || false,
          type: "files"
        };
      });

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
      throw Error("Failed to update app configuration");
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
  UpdateAssetTypes(types) {
    this.availableAssetTypes = types;
  }

  @action.bound
  UpdateTitleTypes(types) {
    this.availableTitleTypes = types;
  }
}

export default SpecStore;
