import {observable, action, flow, toJS, computed} from "mobx";
import {DateTime} from "luxon";
import {ElvClient} from "@eluvio/elv-client-js";
import UrlJoin from "url-join";

import DefaultSpec from "@eluvio/elv-client-js/typeSpecs/Default";
import {parse} from "node-html-parser";
import IsEqual from "lodash/isEqual";
import {ReferencePathElements} from "../components/Inputs";
import Specs from "../typeSpecs/Specs";

require("elv-components-js/src/utils/LimitedMap");

// Incremental numerical IDs

let __id = 0;
class Id {
  static next(){
    __id++;
    return __id;
  }
}

const Slugify = str =>
  (str || "")
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9\-]/g,"")
    .replace(/-+/g, "-");

const AssetMetadataFields =(level) => {
  return [
    "ip_title_id",
    "asset_type",
    "title",
    "display_title",
    "slug",
    "sources",
    "."
  ]
    .map(key =>
      level === undefined ?
        [`*/${key}`, `*/*/${key}`] :
        `${"*/".repeat(level)}${key}`
    )
    .flat()
    .sort();
};

const LocalizationUnmerge = (localized, main) => {
  if(Array.isArray(main)) {
    return main.map((item, index) => LocalizationUnmerge((localized || [])[index], item)).filter(item => item);
  } else if(typeof main === "object") {
    let item = {};
    Object.keys(main).map(key =>
      item[key] = LocalizationUnmerge((localized || {})[key], main[key])
    );

    return item;
  } else {
    return IsEqual(localized, main) ? undefined : localized;
  }
};

const LocalizationMerge = (localized, main) => {
  if(Array.isArray(main)) {
    return main.map((item, index) => LocalizationMerge((localized || [])[index], item)).filter(item => item);
  } else if(typeof main === "object") {
    let item = {};
    Object.keys(main).map(key =>
      item[key] = LocalizationMerge((localized || {})[key], main[key])
    );

    return item;
  } else {
    return localized || main;
  }
};

class FormStore {
  @observable editWriteToken;

  @observable localizedData = {};

  @observable assetInfo = {};

  @observable images = [];
  @observable localizedImages = {};

  @observable playlists = [];
  @observable localizedPlaylists = {};

  @observable credits = {};
  @observable localizedCredits = {};

  @observable assets = {};

  @observable siteCustomization = {
    header: "",
    subheader: "",
    logo: undefined,
    dark_logo: undefined,
    background_image: undefined,
    colors: {
      background: "#002957",
      primary_text: "#ffffff",
      secondary_text: "#8c8c8c"
    },
    arrangement: []
  };

  @observable hideImageTab = false;
  @observable showIndexerSettings = false;
  @observable permissionsObject;

  @observable controls = [];
  @observable fileControls = [];
  @observable fileControlItems = {};
  @observable availableAssetTypes = [];
  @observable availableTitleTypes = [];
  @observable defaultImageKeys = [];
  @observable associatedAssets = [];
  @observable infoFields = [];
  @observable infoFieldLocalizations = {};

  @observable localization;
  @observable currentLocalization = ["", "", ""];

  @observable slugWarning = false;
  @observable siteSelectorInfo = {};

  @computed get relevantAssociatedAssets() {
    return this.associatedAssets.filter(assetType => (
      !assetType.for_title_types ||
      assetType.for_title_types.length === 0 ||
      assetType.for_title_types.includes(this.assetInfo.title_type)
    ));
  }

  @computed get localizationActive() {
    return this.currentLocalization[0] && this.currentLocalization[1];
  }

  @computed get localizationKey() {
    return this.currentLocalization.filter(key => key).join("-");
  }

  @computed get currentLocalizedData() {
    if(!this.localizationActive) {
      return this;
    }

    const [l0, l1, l2] = this.currentLocalization;

    if(l2) {
      return this.localizedData[l0][l1][l2];
    }

    return this.localizedData[l0][l1];
  }

  @computed get localizableFileControls() {
    return this.fileControls.filter(control =>
      control.target.startsWith("public/asset_metadata") || control.target.startsWith("/public/asset_metadata")
    );
  }

  @computed get availableNTPs() {
    if(!this.permissionsObject) { return []; }

    const ntps = (this.permissionsObject.auth_policy_settings || {}).ntp_instances || {};

    return Object.keys(ntps).map(ntpId => ({ntpId, name: ntps[ntpId].name}));
  }

  InfoFieldLocalization(name) {
    if(!this.localizationActive) { return; }

    if(this.currentLocalization[2]) {
      return this.rootStore.client.utils.SafeTraverse(
        this.infoFieldLocalizations,
        this.currentLocalization[0],
        this.currentLocalization[1],
        this.currentLocalization[2],
        name
      );
    } else {
      return this.rootStore.client.utils.SafeTraverse(
        this.infoFieldLocalizations,
        this.currentLocalization[0],
        this.currentLocalization[1],
        name
      );
    }
  }

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.targets = {};
    this.linkHashes = {};
  }

  HasControl(control) {
    return !!this.controls.find(c => typeof c === "string" ? control === c : c.type === control);
  }

  CreateLink({targetHash, linkTarget="/meta/public/asset_metadata", options={}}) {
    const Utils = rootStore.client.utils;
    if(!targetHash || Utils.DecodeVersionHash(targetHash).objectId === Utils.DecodeVersionHash(this.rootStore.params.versionHash).objectId) {
      return {
        ...options,
        ".": {
          ...(options["."] || {}),
          "auto_update":{"tag":"latest"}
        },
        "/": UrlJoin("./", linkTarget)
      };
    } else {
      return {
        ...options,
        ".": {
          ...(options["."] || {}),
          "auto_update":{"tag":"latest"}
        },
        "/": UrlJoin("/qfab", targetHash, linkTarget)
      };
    }
  }

  @action.bound
  SetCurrentLocalization = flow(function * (options) {
    // If switching from localization, unmerge it
    const [c0, c1, c2] = this.currentLocalization;
    if(c2) {
      this.localizedData[c0][c1][c2].assetInfo = LocalizationUnmerge(this.localizedData[c0][c1][c2].assetInfo, this.assetInfo);
    } else if(c1) {
      this.localizedData[c0][c1].assetInfo = LocalizationUnmerge(this.localizedData[c0][c1].assetInfo, this.assetInfo);
    }

    const l0 = options[0] || "";
    const l1 = options[1] || "";
    const l2 = options[2] || "";

    this.localizedData[l0] = this.localizedData[l0] || {};
    this.localizedData[l0][l1] = this.localizedData[l0][l1] || {};

    let assetMetadata = this.rootStore.client.utils.SafeTraverse(this.rootStore.assetMetadata, l0, l1) || {};

    let target;
    if(l2) {
      target = this.localizedData[l0][l1][l2];
    } else {
      target = this.localizedData[l0][l1];
    }

    if(!target._loaded) {
      target.assetInfo = yield this.LoadAssetInfo(assetMetadata);
      target.credits = this.LoadCredits((assetMetadata.info || {}).talent);

      target.images = [];
      target.playlists = [];
      target.fileControlItems = {};
      this.localizableFileControls.forEach(control => target.fileControlItems[control.name] = []);

      target.assets = target.assets || {};

      // Set localization immediately, async controls may be filled in later
      this.currentLocalization = options;

      target.images = yield this.LoadImages(assetMetadata.images, true);
      target.playlists = yield this.LoadPlaylists(assetMetadata.playlists);

      for(let i = 0; i < this.localizableFileControls.length; i++) {
        const control = this.localizableFileControls[i];
        target.fileControlItems[control.name] = yield this.LoadFileControl(control);
      }

      for(let i = 0; i < this.associatedAssets.length; i++) {
        const assetSpec = this.associatedAssets[i];
        const name = assetSpec.name;

        target.assets[name] = yield this.LoadAssets(
          assetMetadata[name],
          UrlJoin("public", "asset_metadata", l0, l1, l2, name)
        );
      }

      target._loaded = true;
    }

    target.assetInfo = LocalizationMerge(target.assetInfo, this.assetInfo);

    if(l2) {
      this.localizedData[l0][l1][l2] = target;
    } else {
      this.localizedData[l0][l1] = target;
    }

    this.currentLocalization = options;
  });

  @action.bound
  ClearCurrentLocalization() {
    // Unmerge current localization
    const [c0, c1, c2] = this.currentLocalization;
    if(c2) {
      this.localizedData[c0][c1][c2].assetInfo = LocalizationUnmerge(this.localizedData[c0][c1][c2].assetInfo, this.assetInfo);
    } else if(c1) {
      this.localizedData[c0][c1].assetInfo = LocalizationUnmerge(this.localizedData[c0][c1].assetInfo, this.assetInfo);
    }

    this.currentLocalization = ["", "", ""];
  }

  InitializeSpec() {
    let config = this.rootStore.titleConfiguration;
    if(config && config.profile && config.profile.name) {
      const configKey = Object.keys(Specs).find(name => config.profile.name.toLowerCase().includes(name.toLowerCase()));

      if(configKey) {
        // Merge so that things like localization options are preserved
        config = {
          ...this.rootStore.titleConfiguration,
          ...Specs[configKey]
        };
      } else {
        // eslint-disable-next-line no-console
        console.error("Non-default type:", config.profile.name);
      }
    }

    const controls = config.controls || DefaultSpec.controls;
    this.fileControls = controls
      .filter(control => typeof control === "object")
      .map(control => {
        control.link_key = control.link_key || control.linkKey;
        return control;
      });
    this.controls = controls;

    this.associatePermissions = config.associate_permissions;
    this.availableAssetTypes = config.asset_types || DefaultSpec.asset_types;
    this.availableTitleTypes = config.title_types || DefaultSpec.title_types;
    this.infoFields = config.info_fields || DefaultSpec.info_fields;
    this.infoFieldLocalizations = config.info_field_localizations;
    this.associatedAssets = config.associated_assets || DefaultSpec.associated_assets;
    this.defaultImageKeys = config.default_image_keys || DefaultSpec.default_image_keys;
    this.hideImageTab = config.hide_image_tab;

    this.localization = config.localization;
  }

  InitializeFormData = flow(function * () {
    this.InitializeSpec();

    yield this.LoadPermissionsObject();

    const assetMetadata = this.rootStore.assetMetadata || {};

    this.assetInfo = yield this.LoadAssetInfo(assetMetadata);
    this.credits = this.LoadCredits((assetMetadata.info || {}).talent);
    this.images = yield this.LoadImages(assetMetadata.images, true);
    this.playlists = yield this.LoadPlaylists(assetMetadata.playlists);

    for(let i = 0; i < this.fileControls.length; i++) {
      const control = this.fileControls[i];
      this.fileControlItems[control.name] = yield this.LoadFileControl(control);
    }

    // Load all clip types
    for(let i = 0; i < this.associatedAssets.length; i++) {
      const assetSpec = this.associatedAssets[i];
      const name = assetSpec.name;

      this.assets[name] = yield this.LoadAssets(
        assetMetadata[name],
        `public/asset_metadata/${name}`
      );
    }

    if(this.HasControl("site_customization")) {
      yield this.LoadSiteCustomization(assetMetadata.site_customization);
    }

    if(this.HasControl("vod_channel")) {
      yield this.rootStore.vodChannelStore.LoadChannelInfo();
    }
  });

  @action.bound
  UpdateAssetInfo(key, value) {
    if(this.localizationActive) {
      this.currentLocalizedData.assetInfo[key] = value;
    } else {
      // Normal asset metadata
      this.assetInfo[key] = value;

      if(key === "display_title" && !this.originalSlug) {
        this.assetInfo.slug = Slugify(value);
      } else if(key === "slug" && this.originalSlug) {
        this.slugWarning = this.originalSlug !== value;
      }
    }
  }

  // Permissions
  @action.bound
  LoadPermissionsObject = flow(function * () {
    const {libraryId, objectId} = this.rootStore.params;

    this.permissionsObject = yield this.rootStore.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken: this.editWriteToken,
      metadataSubtree: "associated_permissions",
      select: [
        ".",
        "auth_policy_settings",
        "public/name"
      ],
      resolveLinks: true,
      resolveIncludeSource: true
    });

    if(this.permissionsObject) {
      this.permissionsObject.name = this.permissionsObject.public.name;
      this.permissionsObject.versionHash = this.permissionsObject["."].source;
    }
  });

  @action.bound
  SetPermissionsObject = flow(function * ({objectId, versionHash}) {
    if(!objectId && versionHash) {
      objectId = this.rootStore.client.utils.DecodeVersionHash(versionHash).objectId;
    }

    const params = this.rootStore.params;

    if(!this.editWriteToken) {
      this.editWriteToken = (yield this.rootStore.client.EditContentObject({
        libraryId: params.libraryId,
        objectId: params.objectId
      })).writeToken;
    }

    yield this.rootStore.client.ReplaceMetadata({
      libraryId: params.libraryId,
      objectId: params.objectId,
      writeToken: this.editWriteToken,
      metadataSubtree: UrlJoin("associated_permissions"),
      metadata: this.CreateLink({
        targetHash: yield this.rootStore.client.LatestVersionHash({objectId}),
        linkTarget: "/meta"
      })
    });

    yield this.LoadPermissionsObject();
  });

  @action.bound
  RemovePermissionsObject = flow(function * () {
    this.permissionsObject = undefined;

    const params = this.rootStore.params;

    if(!this.editWriteToken) {
      this.editWriteToken = (yield this.rootStore.client.EditContentObject({
        libraryId: params.libraryId,
        objectId: params.objectId
      })).writeToken;
    }

    yield this.rootStore.client.DeleteMetadata({
      libraryId: params.libraryId,
      objectId: params.objectId,
      writeToken: this.editWriteToken,
      metadataSubtree: UrlJoin("associated_permissions"),
    });
  });

  // Credits

  @action.bound
  AddCreditGroup() {
    this.currentLocalizedData.credits.push({
      group: "",
      talentType: "",
      credits: []
    });
  }

  @action.bound
  RemoveCreditGroup({groupIndex}) {
    this.currentLocalizedData.credits =
      this.currentLocalizedData.credits.filter((_, i) => i !== groupIndex);
  }

  @action.bound
  UpdateCreditGroup({groupIndex, key, value}) {
    this.currentLocalizedData.credits[groupIndex][key] = value;
  }

  @action.bound
  AddCredit({groupIndex}) {
    this.currentLocalizedData.credits[groupIndex].credits.push({
      character_name: "",
      talent_first_name: "",
      talent_last_name: ""
    });
  }

  @action.bound
  UpdateCredit({groupIndex, creditIndex, key, value}) {
    this.currentLocalizedData.credits[groupIndex].credits[creditIndex][key] = value;
  }

  @action.bound
  SwapCredit({groupIndex, i1, i2}) {
    const credit = this.currentLocalizedData.credits[groupIndex].credits[i1];
    this.currentLocalizedData.credits[groupIndex].credits[i1] = this.currentLocalizedData.credits[groupIndex].credits[i2];
    this.currentLocalizedData.credits[groupIndex].credits[i2] = credit;
  }

  @action.bound
  RemoveCredit({groupIndex, creditIndex}) {
    this.currentLocalizedData.credits[groupIndex].credits =
      this.currentLocalizedData.credits[groupIndex].credits.filter((_, i) => i !== creditIndex);
  }

  // Clips/trailers
  @action.bound
  AddClip = flow(function * ({key, playlistIndex, versionHash}) {
    yield this.RetrieveAsset(versionHash);

    if(playlistIndex !== undefined) {
      // Prevent duplicates
      if(this.currentLocalizedData.playlists[playlistIndex].clips.find(clip => clip.versionHash === versionHash)) {
        return;
      }

      this.currentLocalizedData.playlists[playlistIndex].clips.push({
        versionHash,
        ...this.targets[versionHash]
      });
    } else {
      // Prevent duplicates
      if(this.currentLocalizedData.assets[key].find(clip => clip.versionHash === versionHash)) {
        return;
      }

      this.currentLocalizedData.assets[key].push({
        versionHash,
        ...this.targets[versionHash]
      });
    }
  });

  @action.bound
  UpdateClip = flow(function * ({key, playlistIndex, index}) {
    let clip;
    if(playlistIndex !== undefined) {
      clip = this.currentLocalizedData.playlists[playlistIndex].clips[index];
    } else {
      clip = this.currentLocalizedData.assets[key][index];
    }

    const latestVersionHash = yield this.rootStore.client.LatestVersionHash({versionHash: clip.versionHash});

    if(clip.versionHash !== latestVersionHash) {
      yield this.RetrieveAsset(latestVersionHash);
    }

    const updatedClip = {
      ...clip,
      versionHash: latestVersionHash,
      ...this.targets[latestVersionHash],
      latestVersionHash
    };

    if(playlistIndex !== undefined) {
      this.currentLocalizedData.playlists[playlistIndex].clips[index] = updatedClip;
    } else {
      this.currentLocalizedData.assets[key][index] = updatedClip;
    }
  });

  @action.bound
  RemoveClip({key, playlistIndex, index}) {
    if(playlistIndex !== undefined) {
      this.currentLocalizedData.playlists[playlistIndex].clips =
        this.currentLocalizedData.playlists[playlistIndex].clips.filter((_, i) => i !== index);
    } else {
      this.currentLocalizedData.assets[key] = this.currentLocalizedData.assets[key].filter((_, i) => i !== index);
    }
  }

  @action.bound
  SwapClip({key, playlistIndex, i1, i2}) {
    if(playlistIndex !== undefined) {
      const clip = this.currentLocalizedData.playlists[playlistIndex].clips[i1];
      this.currentLocalizedData.playlists[playlistIndex].clips[i1] = this.currentLocalizedData.playlists[playlistIndex].clips[i2];
      this.currentLocalizedData.playlists[playlistIndex].clips[i2] = clip;
    } else {
      const clip = this.currentLocalizedData.assets[key][i1];
      this.currentLocalizedData.assets[key][i1] = this.currentLocalizedData.assets[key][i2];
      this.currentLocalizedData.assets[key][i2] = clip;
    }
  }

  @action.bound
  SetDefaultClip({key, playlistIndex, index}) {
    const clips = playlistIndex !== undefined ?
      this.currentLocalizedData.playlists[playlistIndex].clips :
      this.currentLocalizedData.assets[key];

    let toUnset;
    if(clips[index].isDefault) {
      // Unset selected
      toUnset = index;
    } else {

      // Unset current default
      toUnset = clips.findIndex(clip => clip.isDefault);
    }

    if(toUnset >= 0) {
      playlistIndex !== undefined ?
        this.currentLocalizedData.playlists[playlistIndex].clips[toUnset].isDefault = false :
        this.currentLocalizedData.assets[key][toUnset].isDefault = false;
    }

    // Set new default
    if(toUnset !== index) {
      playlistIndex !== undefined ?
        this.currentLocalizedData.playlists[playlistIndex].clips[index].isDefault = true :
        this.currentLocalizedData.assets[key][index].isDefault = true;
    }
  }

  // Images
  @action.bound
  UpdateImage({index, imageKey, imagePath, targetHash}) {
    this.currentLocalizedData.images[index] = {
      imageKey,
      imagePath,
      targetHash
    };
  }

  @action.bound
  AddImage() {
    this.currentLocalizedData.images.push({
      imageKey: "",
      imagePath: undefined,
      targetHash: this.rootStore.params.versionHash
    });
  }

  @action.bound
  RemoveImage(index) {
    this.currentLocalizedData.images = this.currentLocalizedData.images.filter((_, i) => i !== index);
  }

  // Configurable File Items
  @action.bound
  UpdateFileControlItem({index, controlName, title, description, path, targetHash}) {
    this.currentLocalizedData.fileControlItems[controlName][index] = {
      title,
      description,
      path,
      targetHash
    };
  }

  @action.bound
  AddFileControlItem({controlName}) {
    this.currentLocalizedData.fileControlItems[controlName].push({
      title: "",
      description: "",
      path: undefined,
      targetHash: this.rootStore.params.versionHash
    });
  }

  @action.bound
  RemoveFileControlItem({controlName, index}) {
    this.currentLocalizedData.fileControlItems[controlName] = this.currentLocalizedData.fileControlItems[controlName].filter((_, i) => i !== index);
  }

  @action.bound
  SwapFileControlItem(controlName, i1, i2) {
    const item = this.currentLocalizedData.fileControlItems[controlName][i1];
    this.currentLocalizedData.fileControlItems[controlName][i1] = this.currentLocalizedData.fileControlItems[controlName][i2];
    this.currentLocalizedData.fileControlItems[controlName][i2] = item;
  }

  // Playlists
  @action.bound
  AddPlaylist() {
    this.currentLocalizedData.playlists.push({
      playlistId: `playlist-${Id.next()}`,
      playlistName: "New Playlist",
      playlistSlug: "new-playlist",
      clips: []
    });
  }

  @action.bound
  UpdatePlaylist({index, key, value}) {
    this.currentLocalizedData.playlists[index][key] = value;
  }

  @action.bound
  RemovePlaylist(index) {
    this.currentLocalizedData.playlists = this.currentLocalizedData.playlists.filter((_, i) => i !== index);
  }

  @action.bound
  SwapPlaylist(i1, i2) {
    const playlist = this.currentLocalizedData.playlists[i1];
    this.currentLocalizedData.playlists[i1] = this.currentLocalizedData.playlists[i2];
    this.currentLocalizedData.playlists[i2] = playlist;
  }

  async LoadInfoFields({PATH="", infoFields, values, isTopLevel=false, topLevelValues}) {
    let info = {};

    for(const infoField of infoFields) {
      try {
        let {name, type, path, reference, default_value, top_level, fields} = infoField;

        if(isTopLevel && path) {
          // Non-standard metadata path - values should be root of path
          values = this.rootStore.client.utils.SafeTraverse(this.rootStore.otherMetadata, path.replace(/^\/|\/$/g, "").split("/")) || {};
        }

        let BASE_PATH = PATH;
        let value;
        if(isTopLevel && top_level) {
          value = topLevelValues[name];
        } else {
          value = values[name];

          if(isTopLevel) {
            BASE_PATH = "info";
          }
        }

        info[name] = (typeof value === "undefined" ? default_value || "" : value);

        if(type === "reference_type") {
          type = this.rootStore.client.utils.SafeTraverse(topLevelValues, ...(ReferencePathElements(BASE_PATH, reference))) || "text";
        }

        if(type === "json") {
          info[name] = info[name] ? JSON.stringify(info[name], null, 2) : "{}";
        } else if((type === "date" || type === "datetime") && info[name]) {
          const date = DateTime.fromISO(values[name]);

          if(!date || date.invalid) {
            info[name] = undefined;
          } else {
            info[name] = date.ts;
          }
        } else if(type === "file" || type === "file_url") {
          let linkInfo = this.LinkComponents(info[name]);

          if(!linkInfo) {
            linkInfo = {targetHash: this.rootStore.params.versionHash};
          } else if(!linkInfo.targetHash) {
            linkInfo.targetHash = await this.rootStore.client.LatestVersionHash({objectId: linkInfo.objectId});
          }

          info[name] = linkInfo;
        } else if(type === "subsection") {
          info[name] = await this.LoadInfoFields({
            PATH: UrlJoin(BASE_PATH, name),
            infoFields: fields,
            values: info[name],
            topLevelValues
          });
        } else if(type === "list") {
          if(!Array.isArray(info[name])) {
            info[name] = [];
          }

          info[name] = await Promise.all(
            (info[name] || []).map(async (listValues, i) => {
              try {
                if(!fields || fields.length === 0) {
                  return listValues;
                }

                return await this.LoadInfoFields({
                  PATH: UrlJoin(BASE_PATH, name, i.toString()),
                  infoFields: fields,
                  values: listValues,
                  topLevelValues
                });
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error("ERROR PARSING LIST:");
                // eslint-disable-next-line no-console
                console.error(name, info, i, listValues);
                // eslint-disable-next-line no-console
                console.error(error);
              }
            })
          );
        } else if(type === "metadata_link") {
          const linkInfo = this.LinkComponents(values[name]);

          if(!linkInfo) {
            continue;
          }

          info[name] = linkInfo.path.replace(/^\.\/meta/, "");
        } else if(type === "fabric_link") {
          const linkInfo = this.LinkComponents(values[name]);

          if(!linkInfo) {
            continue;
          }

          const meta = (await this.rootStore.client.ContentObjectMetadata({
            versionHash: linkInfo.targetHash,
            metadataSubtree: "public",
            select: [
              "name",
              "asset_metadata/title",
              "asset_metadata/display_title"
            ]
          }));

          const targetName = (meta.asset_metadata || {}).display_title || (meta.asset_metadata || {}).title || meta.name;

          info[name] = {
            name: targetName,
            libraryId: this.rootStore.client.ContentObjectLibraryId({versionHash: linkInfo.targetHash}),
            objectId: this.rootStore.client.utils.DecodeVersionHash(linkInfo.targetHash).objectId,
            versionHash: linkInfo.targetHash
          };
        } else if(type === "self_embed_url") {
          if(!info[name] || infoField.auto_update) {
            info[name] = this.rootStore.SelfEmbedUrl(infoField.version, infoField);
          }
        } else if(type === "self_metadata_url") {
          info[name] = this.rootStore.SelfMetadataUrl(infoField.path);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("ERROR PARSING INFO FIELD:");
        // eslint-disable-next-line no-console
        console.error(name, info);
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    return info;
  }

  // Load methods
  LoadAssetInfo = flow(function * (metadata) {
    metadata = metadata || {};

    const info = (metadata.info || {});
    const name = this.rootStore.assetName;

    let assetInfo = {
      title: metadata.title || name,
      display_title: metadata.display_title || name,
      slug: metadata.slug || Slugify(metadata.display_title || name),
      ip_title_id: metadata.ip_title_id || "",
      title_type: metadata.title_type || this.availableTitleTypes[0],
      asset_type: metadata.asset_type || this.availableAssetTypes[0]
    };

    this.originalSlug = metadata.slug;

    const loadedInfo = yield this.LoadInfoFields({
      HEAD: info,
      infoFields: this.infoFields,
      values: info,
      isTopLevel: true,
      topLevelValues: metadata
    });

    assetInfo = {
      ...assetInfo,
      ...loadedInfo
    };

    return assetInfo;
  });

  LoadCredits(metadata) {
    if(!metadata) { return []; }

    let credits = [];
    Object.keys(metadata).map(groupName => {
      let withSeqId = [];
      let withoutSeqId = [];

      metadata[groupName].forEach(credit => {
        // Ensure credit fields are strings
        [
          "character_name",
          "talent_first_name",
          "talent_last_name",
          "other_credits",
          "sales_display_order"
        ]
          .forEach(key => {
            if(typeof credit[key] !== "string") {
              credit[key] = "";
            }
          });

        if(credit.talent_note_seq_id) {
          const index = parseInt(credit.talent_note_seq_id) - 1;
          withSeqId[index] = credit;
        } else {
          withoutSeqId.push(credit);
        }
      });

      credits.push({
        group: groupName,
        talentType: (metadata[groupName][0] || {}).talent_type,
        credits: withSeqId
          .filter(credit => credit)
          .concat(withoutSeqId)
      });
    });

    return credits;
  }

  RetrieveAssetFromLink = flow(function * (linkPath, metadata) {
    if(!this.linkHashes[linkPath]) {
      try {
        if(!metadata) {
          metadata = yield (yield this.rootStore.client.ContentObjectMetadata({
            versionHash: this.rootStore.params.versionHash,
            metadataSubtree: linkPath,
            resolveLinks: true,
            resolveIncludeSource: true,
            resolveIgnoreErrors: true
          })) || {};
        }

        this.linkHashes[linkPath] = metadata["."].source;

        // Cache metadata
        yield this.RetrieveAsset(this.linkHashes[linkPath], metadata);
      } catch (error) {
        const linkInfo = yield (yield this.rootStore.client.ContentObjectMetadata({
          versionHash: this.rootStore.params.versionHash,
          metadataSubtree: linkPath,
          resolveLinks: false
        }));

        this.linkHashes[linkPath] = linkInfo["/"].split("/").find(segment => segment.startsWith("hq__"));
      }
    }

    return this.linkHashes[linkPath];
  });

  // Retrieve information about a clip and add it to targets cache (if not present)
  RetrieveAsset = flow(function * (versionHash, assetMetadata) {
    if(this.targets[versionHash]) { return; }

    if(!assetMetadata) {
      assetMetadata = (yield this.rootStore.client.ContentObjectMetadata({
        versionHash,
        metadataSubtree: "public/asset_metadata",
        select: AssetMetadataFields(0)
      })) || {};
    }

    this.targets[versionHash] = {
      id: assetMetadata.ip_title_id,
      assetType: assetMetadata.asset_type,
      title: assetMetadata.title || assetMetadata.display_title,
      displayTitle: assetMetadata.display_title || assetMetadata.title,
      slug: assetMetadata.slug,
      playable: !!(assetMetadata.sources || {}).default,
      versionHash
    };
  });

  LoadAssets = flow(function * (metadata, linkPath, level) {
    if(!metadata) { return []; }

    let assets = [];
    let unorderedAssets = [];
    let defaultAsset;

    metadata = toJS(metadata);

    // Provided metadata is unresolved. Retrieve full resolved metadata.
    const resolvedMetadata = (yield this.rootStore.client.ContentObjectMetadata({
      versionHash: this.rootStore.params.versionHash,
      metadataSubtree: linkPath,
      select: AssetMetadataFields(level),
      resolveLinks: true,
      resolveIncludeSource: true,
      resolveIgnoreErrors: true
    })) || {};

    // When slugged but not indexed, default choice is duplicated in the 'default' and slug keys.
    if(metadata.default) {
      let defaultMeta = metadata.default;
      if(!defaultMeta["/"]) {
        // Indexed + slugged lists are saved like {"default": {"<slug>": <link>}}
        defaultMeta = defaultMeta[Object.keys(defaultMeta)[0]];
      }

      if(defaultMeta["/"]) {
        const defaultSlug = defaultMeta["/"].split("/").pop();
        delete metadata[defaultSlug];
      }
    }

    const keys = Array.isArray(metadata) ?
      [...new Array(metadata.length).keys()] :
      Object.keys(metadata);

    yield keys.limitedMap(
      10,
      async key => {
        try {
          if(!metadata[key]) { return; }

          const hasSlug = !metadata[key]["/"];
          const slug = hasSlug ? Object.keys(metadata[key])[0] : undefined;

          let fullMetadata = resolvedMetadata[key.toString()] || {};
          if(hasSlug && slug) {
            fullMetadata = fullMetadata[slug];
          }

          const targetHash = await this.RetrieveAssetFromLink(UrlJoin(linkPath, key.toString(), slug || ""), fullMetadata);

          // Order might be saved in the link
          let order = ((hasSlug ? metadata[key][slug] : metadata[key]) || {}).order;

          const asset = {
            versionHash: targetHash,
            isDefault: false,
            originalLink: hasSlug ? metadata[key][slug] : metadata[key],
            ...this.targets[targetHash]
          };

          if(key === "default") {
            asset.isDefault = true;
            defaultAsset = asset;
            return;
          }

          // Keys are ordered indices
          const index = order !== undefined ? order : parseInt(key);
          if(isNaN(index)) {
            // Key not an index, just add it to the back of the list
            unorderedAssets.push(asset);
            return;
          }

          assets[index] = asset;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load asset '${key}':`);
          // eslint-disable-next-line no-console
          console.error(toJS(metadata));
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    );

    // Put default at front of list
    if(defaultAsset) {
      assets.unshift(defaultAsset);
    }

    assets = [
      ...assets,
      ...unorderedAssets
    ];

    // Filter any missing indices
    assets = assets.filter(asset => asset);

    return assets;
  });

  @action.bound
  LinkComponents(link) {
    try {
      if(link && typeof link === "string") {
        // Object ID
        if(link.startsWith("hq__")) {
          return { targetHash: link, path: "", imagePath: "" };
        }

        // URL

        let path = new URL(link).pathname;

        let domain = rootStore.networkInfo.name;
        if(path.startsWith("/s")) {
          domain = path.match(/\/s\/([^\/]+)\//)[1];

          // Remove /s/<domain>/
          path = path.replace(/\/s\/[^\/]+\//, "");
        }

        path = path.replace(/^\/+/g, "");

        let libraryId, objectId, versionHash;
        if(path.startsWith("qlibs")) {
          const parsed = path.match(/qlibs\/([^\/]+)\/q\/([^\/]+)\/(.+)/);
          libraryId = parsed[1];

          if(parsed[2].startsWith("iq__")) {
            objectId = parsed[2];
          } else {
            versionHash = parsed[2];
          }

          path = parsed[3];
        } else {
          const parsed = path.match(/q\/([^\/]+)\/(.+)/);
          versionHash = parsed[1];
          path = parsed[2];
        }

        path = path.startsWith("meta") ? path.replace(/^meta\//, "") : path.replace(/^files\//, "");

        return {
          domain,
          libraryId,
          objectId,
          targetHash: versionHash,
          path,
          imagePath: path
        };
      }

      if(!link || !link["/"]) {
        return;
      }

      let targetHash = this.rootStore.params.versionHash;
      let path = link["/"].replace(/^\.\/files\//, "");
      if(link["/"].startsWith("/qfab/") || link["/"].startsWith("/q/")) {
        targetHash = link["/"].split("/")[2];
        path = link["/"].split("/").slice(4).join("/");
      }

      return {targetHash, path, imagePath: path};
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse link", link);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  LoadImages = flow(function * (metadata) {
    let images = [];
    let imageTargets = [];
    if(metadata) {
      Object.keys(metadata).forEach(async imageKey => {
        try {
          const link = metadata[imageKey].default;

          if(!link || !link["/"]) {
            return;
          }

          const {targetHash, imagePath} = this.LinkComponents(link);

          if(!imageTargets.includes(targetHash)) {
            imageTargets.push(targetHash);
          }

          images.push({
            imageKey,
            imagePath,
            targetHash
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load image '${imageKey}':`);
          // eslint-disable-next-line no-console
          console.error(toJS(metadata));
          // eslint-disable-next-line no-console
          console.error(error);
        }
      });
    }

    this.defaultImageKeys.forEach(imageKey => {
      if(images.find(info => info.imageKey === imageKey)) { return; }

      images.push({
        imageKey,
        imagePath: undefined,
        targetHash: this.rootStore.params.versionHash
      });
    });

    images = images.sort((a, b) => a.imageKey < b.imageKey ? -1 : 1);

    // Ensure all base URLs are set for previews
    yield Promise.all(
      imageTargets.map(async versionHash =>
        await this.rootStore.contentStore.LoadBaseFileUrl(versionHash)
      )
    );

    return images;
  });

  LoadFileControl = flow(function * (control) {
    const [l0, l1, l2] = this.currentLocalization;
    let metadataPath = control.target;
    if(l1) {
      metadataPath = UrlJoin("public", "asset_metadata", l0, l1, l2, metadataPath.replace(/^\/?public\/asset_metadata\//, ""));
    }

    const metadata = (yield this.rootStore.client.ContentObjectMetadata({
      versionHash: this.rootStore.params.versionHash,
      metadataSubtree: metadataPath
    })) || [];

    let items = [];
    let itemTargets = [];

    Object.keys(metadata).forEach(async index => {
      try {
        index = parseInt(index);

        if(isNaN(index)) { return; }

        const info = metadata[index];

        let link = info[control.linkKey || control.link_key || "file"];
        if(link && link.default) {
          link = link.default;
        }

        if(!link || !link["/"]) { return; }

        const {targetHash, path} = this.LinkComponents(link);

        if(!itemTargets.includes(targetHash)) {
          itemTargets.push(targetHash);
        }

        items[index] = {
          title: info.title || "",
          description: info.description || "",
          path,
          targetHash
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load custom file control item ${control.name} '${index}':`);
        // eslint-disable-next-line no-console
        console.error(toJS(metadata));
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });

    // Remove any missing entries
    items = items.filter(item => item);

    // Ensure all base URLs are set
    yield Promise.all(
      itemTargets.map(async versionHash =>
        await this.rootStore.contentStore.LoadBaseFileUrl(versionHash)
      )
    );

    return items;
  });

  LoadPlaylists = flow(function * (metadata) {
    if(!metadata) { return []; }

    let playlists = [];
    let unorderedPlaylists = [];
    if(metadata) {
      yield Promise.all(
        Object.keys(metadata).sort().map(async playlistIndex => {
          if(isNaN(parseInt(playlistIndex))) {
            const [l0, l1, l2] = this.currentLocalization;
            const metadataPath = UrlJoin("public", "asset_metadata", l0, l1, l2, "playlists", playlistIndex.toString(), "list");

            // New format - [playlistSlug]: { ... }
            const playlist = {
              playlistId: `playlist-${Id.next()}`,
              playlistName: metadata[playlistIndex].name || "",
              playlistSlug: playlistIndex,
              clips: await this.LoadAssets(
                metadata[playlistIndex].list,
                metadataPath,
                1
              )
            };

            if(metadata[playlistIndex].order !== undefined) {
              playlists[parseInt(metadata[playlistIndex].order)] = playlist;
            } else {
              unorderedPlaylists.push(playlist);
            }
          } else {
            // Old format: [index]: { [playlistSlug]: ... }
            const playlistSlug = Object.keys(metadata[playlistIndex])[0];

            const [l0, l1, l2] = this.currentLocalization;
            const metadataPath = UrlJoin("public", "asset_metadata", l0, l1, l2, "playlists", playlistIndex.toString(), playlistSlug);

            playlists[parseInt(playlistIndex)] = {
              playlistName: playlistSlug || "",
              playlistSlug,
              clips: await this.LoadAssets(
                metadata[playlistIndex][playlistSlug],
                metadataPath
              )
            };
          }
        })
      );
    }

    return [
      ...playlists.filter(playlist => playlist),
      ...unorderedPlaylists
    ];
  });

  LoadSiteCustomization = flow(function * (metadata) {
    if(!metadata) { return; }

    this.siteCustomization.header = metadata.header || "";
    this.siteCustomization.subheader = metadata.subheader || "";

    if(metadata.logo) {
      this.siteCustomization.logo = this.LinkComponents(metadata.logo);
    }

    if(metadata.dark_logo) {
      this.siteCustomization.dark_logo = this.LinkComponents(metadata.dark_logo);
    }

    if(metadata.background_image) {
      this.siteCustomization.background_image = this.LinkComponents(metadata.background_image);
    }

    if(metadata.colors) {
      this.siteCustomization.colors = {
        ...this.siteCustomization.colors,
        ...metadata.colors
      };
    }

    // Site arrangement
    if(!metadata) {
      this.DefaultArrangement();
    } else {
      let arrangement = toJS(metadata.arrangement || []);
      arrangement = (yield Promise.all(
        arrangement.map(async (entry, index) => {
          if(entry.title) {
            const target = await this.rootStore.client.LinkTarget({
              versionHash: this.rootStore.params.versionHash,
              linkPath: `public/asset_metadata/site_customization/arrangement/${index}/title`
            });

            await this.RetrieveAsset(target);

            entry.title = this.targets[target];
          }

          if(entry.type !== "playlist") {
            return entry;
          }

          const playlist = this.playlists.find(playlist => playlist.playlistSlug === entry.playlist_slug);

          if(!playlist) {
            return;
          }

          entry = {
            ...entry,
            playlistId: playlist.playlistId,
            name: `playlist--${playlist.playlistId}`
          };

          delete entry.playlist_slug;

          return entry;
        })
      ))
        .filter(entry => entry);


      this.siteCustomization.arrangement = arrangement;
    }

    if(this.HasControl("premiere")) {
      if(metadata.premiere && metadata.premiere.title) {
        try {
          const target = yield this.rootStore.client.LinkTarget({
            versionHash: this.rootStore.params.versionHash,
            linkPath: "public/asset_metadata/site_customization/premiere/title"
          });

          let price = parseFloat(metadata.premiere.price);
          price = isNaN(price) ? "0.00" : price.toFixed(2);

          yield this.RetrieveAsset(target);
          this.siteCustomization.premiere = {
            title: this.targets[target],
            premieresAt:  DateTime.fromISO(metadata.premiere.premieresAt),
            price: price,
            enabled: true
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to load premiere title");
          // eslint-disable-next-line no-console
          console.error(error);
        }
      } else {
        delete this.siteCustomization.premiere;
      }
    }
  });

  async FormatAssets({assetType, assets}) {
    // If not slugged or indexed, asset is saved as array
    let formattedAssets = assetType.indexed || assetType.slugged ? {} : [];
    const hasDefault = assets.find(({isDefault}) => isDefault);
    let index = hasDefault ? 1 : 0;

    await Promise.all(
      (assets || []).map(async ({displayTitle, versionHash, isDefault, slug, originalLink={}}) => {
        const link = this.CreateLink({targetHash: versionHash, options: originalLink});

        let key;
        if(isDefault) {
          key = "default";
        } else {
          key = index;
          index += 1;
        }

        if(assetType.slugged) {
          if(!slug) {
            slug = (await this.rootStore.client.ContentObjectMetadata({
              versionHash,
              metadataSubtree: UrlJoin("public", "asset_metadata", "slug")
            })) || Slugify(displayTitle);
          }

          if(assetType.indexed) {
            formattedAssets[key] = {
              [slug]: link
            };
          } else {
            if(key === "default") {
              formattedAssets.default = this.CreateLink({
                targetHash: this.rootStore.params.versionHash,
                linkTarget: `/meta/public/asset_metadata/${assetType.name}/${slug}`,
                options: { order: 0 },
              });
              link.order = 0;
            } else {
              link.order = key;
            }

            // If slugged but not indexed, 'default' is link to regular slug
            formattedAssets[slug] = link;
          }
        } else if(assetType.indexed) {
          formattedAssets[key] = link;
        } else {
          formattedAssets.push(link);
        }
      })
    );

    return formattedAssets;
  }

  FormatDate(millis, datetime=false) {
    if(!millis) { return ""; }

    try {
      return datetime ?
        DateTime.fromMillis(millis).toISO({suppressMilliseconds: true}) :
        DateTime.fromMillis(millis).toFormat("yyyy-LL-dd");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse time for", name);
    }

    return "";
  }

  FormatFields({HEAD, PATH="", infoFields, values, titleType, isTopLevel=false, splitListFields=true}) {
    let topInfo = {};
    let info = {};
    let nonStandardInfo = {};
    let listFields = [];

    infoFields.forEach(field => {
      if(field.for_title_types && field.for_title_types.length > 0 && !field.for_title_types.includes(titleType)) { return; }

      const name = field.name;
      let type = field.type;

      if(type === "reference_type") {
        type = this.rootStore.client.utils.SafeTraverse(HEAD, ...(ReferencePathElements(PATH, field.reference))) || "text";
      }

      let value = values[name];
      if(type === "integer") {
        value = parseInt(values[name]);
      } else if(type === "number") {
        value = parseFloat(values[name]);
      } else if(type === "json") {
        try {
          value = JSON.parse(values[name]);
        } catch (error) {
          throw Error(`Failed to parse JSON field ${name}`);
        }
      } else if(type === "date") {
        value = this.FormatDate(values[name]);
      } else if(type === "datetime") {
        value = this.FormatDate(values[name], true);
      } else if(type === "file") {
        if(values[name] && values[name].path) {
          value = this.CreateLink({
            targetHash: values[name].targetHash,
            linkTarget: UrlJoin("files", values[name].path)
          });
        } else {
          value = null;
        }
      } else if(type === "file_url") {
        if(!values[name] || !values[name].targetHash || !values[name].path) { return ""; }

        const url = new URL(`https://${this.rootStore.networkInfo.name}.net${this.rootStore.networkInfo.id}.contentfabric.io`);
        url.pathname = UrlJoin("s", this.rootStore.networkInfo.name, "q", values[name].targetHash, "files", values[name].path);

        value = url.toString();
      } else if(type === "rich_text") {
        // Set target="_blank" and rel="noopener" on all links
        const html = parse((value || "").toString("html"));
        const links = html.querySelectorAll("a");
        links.forEach(link => {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener");
        });

        value = html.toString();
      } else if(type === "subsection") {
        value = this.FormatFields({HEAD, PATH: UrlJoin(PATH, name), infoFields: field.fields, values: values[name], titleType}).info || {};
      } else if(type === "list") {
        value = (value || []).map((entry, i) => {
          entry = toJS(entry);

          if(!field.fields || field.fields.length === 0) {
            return entry;
          }

          return (this.FormatFields({HEAD, PATH: UrlJoin(PATH, name, i.toString()), infoFields: field.fields, values: entry, titleType})).info || [];
        });
      } else if(type === "fabric_link") {
        if(values[name]) {
          if(field.hash_only) {
            value = values[name].versionHash;
          } else {
            value = this.CreateLink({targetHash: values[name].versionHash});
          }
        }
      } else if(type === "metadata_link") {
        if(values[name]) {
          value = this.CreateLink({
            targetHash: this.rootStore.params.versionHash,
            linkTarget: UrlJoin("/meta", values[name])
          });
        }
      } else if(type === "self_embed_url") {
        if(field.auto_update) {
          info[name] = this.rootStore.SelfEmbedUrl(field.version, field);
        }
      }

      value = toJS(value);

      if(isTopLevel && field.path) {
        nonStandardInfo[name] = {
          value,
          path: UrlJoin(field.path, name)
        };
      } else if(!isTopLevel) {
        info[name] = value;
      } else {
        if(splitListFields && (type === "list" || type === "multiselect")) {
          // List type - Since we're doing a merge on the info metadata, we must do an explicit replace call to modify lists
          listFields.push({name, value, top_level: field.top_level});
        } else if(field.top_level) {
          // Top level specified, keep value at root level `public/asset_metadata/
          topInfo[name] = value;
        } else {
          // Default case - field is in info
          info[name] = value;
        }
      }
    });

    return { info, topInfo, nonStandardInfo, listFields };
  }

  @action.bound
  SaveAsset = flow(function * (commit=true, commitMessage="") {
    try {
      const client = this.rootStore.client;

      const {libraryId, objectId} = this.rootStore.params;

      let writeToken = this.editWriteToken;
      if(!writeToken) {
        writeToken = (yield client.EditContentObject({
          libraryId,
          objectId
        })).write_token;
      }

      if(!writeToken) {
        throw Error("Update request denied");
      }

      // Localizable data
      let localizationKeys = [["", "", ""]];
      for(let l0 of Object.keys(this.localizedData)) {
        for(let l1 of Object.keys(this.localizedData[l0])) {
          if(this.localizedData[l0][l1]._loaded) {
            localizationKeys.push([l0, l1, ""]);
          } else {
            Object.keys(this.localizedData[l0][l1]).forEach(l2 =>
              localizationKeys.push([l0, l1, l2])
            );
          }
        }
      }

      for(let [l0, l1, l2] of localizationKeys) {
        let localizedData = this;
        if(l2) {
          localizedData = this.localizedData[l0][l1][l2];
        } else if(l1) {
          localizedData = this.localizedData[l0][l1];
        }

        if(l1) {
          localizedData.assetInfo = LocalizationUnmerge(localizedData.assetInfo, this.assetInfo);
        }

        const {info, topInfo, nonStandardInfo} = this.FormatFields({
          HEAD: localizedData.assetInfo,
          infoFields: this.infoFields,
          values: localizedData.assetInfo,
          titleType: this.assetInfo.title_type,
          isTopLevel: true,
          splitListFields: false
        });

        // Move built-in fields to top level info
        ["title", "display_title", "ip_title_id", "slug", "title_type", "asset_type"]
          .forEach(attr => {
            if(localizedData.assetInfo[attr]) {
              topInfo[attr] = localizedData.assetInfo[attr];
            }
          });

        // For localized info, only include data that is present
        if(l0) {
          delete topInfo.title_type;
          delete topInfo.asset_type;

          for(let key of Object.keys(topInfo)) {
            if(!topInfo[key]) {
              delete topInfo[key];
            }
          }

          for(let key of Object.keys(info)) {
            if(!info[key]) {
              delete info[key];
            }
          }
        }

        // Credits
        let credits = {};
        toJS(localizedData.credits).map(group => {
          credits[group.group] =
            group.credits.map((credit, index) => ({
              ...credit,
              talent_type: group.talentType,
              talent_note_seq_id: (index + 1).toString().padStart(2, "0"),
              sales_display_order: credit.sales_display_order ?
                credit.sales_display_order.padStart(2, "0") : ""
            }));
        });

        // Images
        let images = {};
        toJS(localizedData.images).forEach(({imageKey, imagePath, targetHash}) => {
          if(!imageKey || !imagePath) {
            return;
          }

          images[imageKey] = {
            default: this.CreateLink({targetHash, linkTarget: UrlJoin("files", imagePath)}),
            thumbnail: this.CreateLink({targetHash, linkTarget: UrlJoin("rep", "thumbnail", "files", imagePath)})
          };
        });

        // Associated assets
        let assetData = {};
        for(let i = 0; i < this.associatedAssets.length; i++) {
          const assetType = this.associatedAssets[i];
          const assets = toJS(localizedData.assets[assetType.name]);

          assetData[assetType.name] = yield this.FormatAssets({assetType, assets});
        }

        // Playlists
        let playlists = {};
        yield Promise.all(
          toJS(localizedData.playlists).map(async ({playlistName, playlistSlug, clips}, index) => {
            if(!playlistSlug) {
              return;
            }

            const list = await this.FormatAssets({
              assetType: {
                indexed: false,
                slugged: true,
                name: `playlists/${playlistSlug}/list`
              },
              assets: clips
            });

            playlists[playlistSlug] = {
              name: playlistName || playlistSlug,
              count: clips.length,
              order: index,
              list
            };
          })
        );

        // Merge non-localized asset metadata with existing metadata
        let existingMetadata = { info: {} };
        if(!l0) {
          existingMetadata = (yield client.ContentObjectMetadata({
            libraryId,
            objectId,
            metadataSubtree: UrlJoin("public", "asset_metadata")
          })) || {};
        }

        const mergedMetadata = {
          ...existingMetadata,
          ...topInfo,
          ...assetData,
          images,
          playlists,
          info: {
            ...(existingMetadata.info || {}),
            ...info,
            talent: credits
          }
        };

        yield client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: UrlJoin("public", "asset_metadata", l0, l1, l2),
          metadata: mergedMetadata
        });

        yield Promise.all(
          Object.values(nonStandardInfo).map(async ({path, value}) => {
            await client.ReplaceMetadata({
              libraryId,
              objectId,
              writeToken,
              metadataSubtree: path,
              metadata: value
            });
          })
        );

        // Configurable Controls
        for(let i = 0; i < this.fileControls.length; i++) {
          const control = this.fileControls[i];

          // Skip non-localizable controls for localized data
          if(l1 && !(control.target.startsWith("public/asset_metadata") || control.target.startsWith("/public/asset_metadata"))) {
            continue;
          }

          let items = {};
          toJS(localizedData.fileControlItems[control.name]).forEach(({title, description, path, targetHash}, index) => {
            if(!path) {
              return;
            }

            let file;
            if(control.thumbnail) {
              file = {
                default: this.CreateLink({targetHash, linkTarget: UrlJoin("files", path)}),
                thumbnail: this.CreateLink({targetHash, linkTarget: UrlJoin("rep", "thumbnail", "files", path)})
              };
            } else {
              file = this.CreateLink({targetHash, linkTarget: UrlJoin("files", path)});
            }

            items[index.toString()] = {
              title,
              description,
              [control.linkKey || control.link_key || "file"]: file
            };
          });

          let metadataPath = control.target;
          if(l1) {
            metadataPath = UrlJoin("public", "asset_metadata", l0, l1, l2, metadataPath.replace(/^\/?public\/asset_metadata\//, ""));
          }

          yield client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: metadataPath,
            metadata: items
          });
        }
      }


      if(this.HasControl("site_customization")) {
        let siteCustomization = {...toJS(this.siteCustomization)};

        if(siteCustomization.logo && siteCustomization.logo.targetHash && siteCustomization.logo.imagePath) {
          siteCustomization.logo = this.CreateLink({
            targetHash: siteCustomization.logo.targetHash,
            linkTarget: UrlJoin("files", siteCustomization.logo.imagePath)
          });
        }

        if(siteCustomization.dark_logo && siteCustomization.dark_logo.targetHash && siteCustomization.dark_logo.imagePath) {
          siteCustomization.dark_logo = this.CreateLink({
            targetHash: siteCustomization.dark_logo.targetHash,
            linkTarget: UrlJoin("files", siteCustomization.dark_logo.imagePath)
          });
        }

        if(siteCustomization.background_image && siteCustomization.background_image.targetHash && siteCustomization.background_image.imagePath) {
          siteCustomization.background_image = this.CreateLink({
            targetHash: siteCustomization.background_image.targetHash,
            linkTarget: UrlJoin("files", siteCustomization.background_image.imagePath)
          });
        }

        siteCustomization.arrangement = this.siteCustomization.arrangement.map(entry => {
          entry = {...toJS(entry)};
          if(entry.type === "playlist") {
            const playlist = this.playlists.find(playlist => playlist.playlistId === entry.playlistId);
            entry.playlist_slug = playlist.playlistSlug;
            entry.name = "playlist";
            delete entry.playlistId;
          } else if(entry.title) {
            entry.title = this.CreateLink({targetHash: entry.title.versionHash});
          }

          return entry;
        });

        if(this.HasControl("premiere")) {
          if(!siteCustomization.premiere || !siteCustomization.premiere.enabled || !siteCustomization.premiere.title) {
            delete siteCustomization.premiere;
          } else {
            delete siteCustomization.premiere.enabled;

            let price = parseFloat(this.siteCustomization.premiere.price);
            price = isNaN(price) ? "0.00" : price.toFixed(2);

            siteCustomization.premiere.title = this.CreateLink({targetHash: siteCustomization.premiere.title.versionHash});
            siteCustomization.premiere.premieresAt = this.FormatDate(siteCustomization.premiere.premieresAt || Date.now(), true);
            siteCustomization.premiere.price = price;
          }
        }

        yield client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "public/asset_metadata/site_customization",
          metadata: siteCustomization
        });
      }

      if(this.HasControl("live_stream")) {
        yield this.rootStore.liveStore.SaveLiveParameters({writeToken});
      }

      if(this.HasControl("channel")) {
        yield this.rootStore.channelStore.SaveChannelInfo({writeToken});
      }

      if(this.HasControl("vod_channel")) {
        yield this.rootStore.vodChannelStore.SaveChannelInfo({writeToken});
      }

      if(!commit) {
        this.editWriteToken = writeToken;
        return;
      }

      yield client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: commitMessage || "Asset Manager"
      });

      yield client.SendMessage({
        options: {
          operation: "Complete",
          message: "Successfully updated asset"
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Save failed:");
      // eslint-disable-next-line no-console
      console.error(error);

      throw error;
    }
  });

  // Site Customization

  @action.bound
  UpdateSiteCustomization({key, value}) {
    this.siteCustomization[key] = value;
  }

  @action.bound
  UpdateSiteColor({colorKey, color}) {
    this.siteCustomization.colors[colorKey] = color;
  }

  @action.bound
  UpdateSiteLogo({variant="light", imagePath, targetHash}) {
    if(variant === "dark") {
      this.siteCustomization.dark_logo = {imagePath, targetHash};
    } else {
      this.siteCustomization.logo = {imagePath, targetHash};
    }
  }

  @action.bound
  UpdateSiteBackgroundImage({imagePath, targetHash}) {
    this.siteCustomization.background_image = {imagePath, targetHash};
  }

  @action.bound
  DefaultArrangement() {
    let arrangement = [];

    arrangement = arrangement.concat(
      this.playlists.map(playlist => ({
        type: "playlist",
        name: `playlist--${playlist.playlistId}`,
        label: playlist.playlistName,
        playlistId: playlist.playlistId,
        component: "carousel",
        options: {
          variant: "landscape"
        }
      }))
    );

    arrangement = arrangement.concat(
      this.relevantAssociatedAssets.map(assetType => ({
        type: "asset",
        name: assetType.name,
        label: assetType.label,
        playlistId: undefined,
        component: "carousel",
        options: {
          variant: "landscape"
        }
      }))
        .sort((a, b) => a.name < b.name ? -1 : 1)
    );

    this.siteCustomization.arrangement = arrangement;
  }

  @action.bound
  AddArrangementEntry() {
    let initialEntry;
    if(this.associatedAssets[0]) {
      initialEntry = {
        type: "asset",
        name: this.associatedAssets[0].name,
        label: this.associatedAssets[0].label,
        playlistId: undefined,
        component: "carousel",
        options: {
          width: 4
        }
      };
    } else if(this.playlists[0]) {
      initialEntry = {
        type: "playlist",
        name: "playlist",
        label: this.playlists[0].label,
        playlistId: this.playlists[0].playlistId,
        component: "carousel",
        options: {
          width: 4
        }
      };
    } else {
      initialEntry = {
        type: "header",
        playlistId: undefined,
        options: {
          text: "New Header"
        }
      };
    }

    this.siteCustomization.arrangement.push(initialEntry);
  }

  @action.bound
  UpdateArrangementEntry({index, attrs}) {
    this.siteCustomization.arrangement[index] = attrs;
  }

  @action.bound
  SwapArrangementEntries(i1, i2) {
    const image = this.siteCustomization.arrangement[i1];
    this.siteCustomization.arrangement[i1] = this.siteCustomization.arrangement[i2];
    this.siteCustomization.arrangement[i2] = image;
  }

  @action.bound
  RemoveArrangementEntry(index) {
    this.siteCustomization.arrangement = this.siteCustomization.arrangement.filter((_, i) => i !== index);
  }

  @action.bound
  SetArrangementEntryTitle = flow(function * (index, versionHash) {
    yield this.RetrieveAsset(versionHash);

    this.siteCustomization.arrangement[index].title = this.targets[versionHash];
  });

  @action.bound
  UpdatePremiere(premiere) {
    this.siteCustomization.premiere = premiere;
  }

  @action.bound
  SetPremiereTitle = flow(function * (versionHash) {
    yield this.RetrieveAsset(versionHash);

    this.siteCustomization.premiere.title = this.targets[versionHash];
  });


  // Site Selector + Access Keys

  @action.bound
  LoadSiteSelectorInfo = flow(function * () {
    const client = this.rootStore.client;
    const groupAddresses = yield client.Collection({
      collectionType: "accessGroups"
    });

    const existingCodes = (yield client.ContentObjectMetadata({
      versionHash: this.rootStore.params.versionHash,
      metadataSubtree: "public/codes"
    })) || {};

    let existingSites = {};
    Object.values(existingCodes).forEach(({sites}) => {
      return (sites || []).forEach(site => {
        if(!site || sites[site.siteKey]) { return; }

        existingSites[site.siteKey] = site.siteId;
      });
    });

    const groups = (yield Promise.all(
      groupAddresses.map(async address => {
        const libraryId = (await client.ContentSpaceId()).replace(/^ispc/, "ilib");
        const objectId = client.utils.AddressToObjectId(address);
        const name = await client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "public/name"
        });

        return [name || address, address, name ? name.toLowerCase() : `zzzz${address}`];
      })
    )).sort((a, b) => a[2] < b[2] ? -1 : 1);

    this.siteSelectorInfo = {
      groups,
      sites: Object.keys(existingSites).sort((a, b) => a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1),
      siteMap: existingSites
    };
  });

  Hash = (code) => {
    const chars = code.split("").map(code => code.charCodeAt(0));
    return chars.reduce((sum, char, i) => (chars[i + 1] ? (sum * 2) + char * chars[i+1] * (i + 1) : sum + char), 0).toString();
  };

  @action.bound
  RemoveSiteAccessCode = flow(function * ({accessCode}) {
    const {libraryId, objectId} = this.rootStore.params;

    try {
      const client = this.rootStore.client;

      const codeHash = this.Hash(accessCode);
      let existingCodeInfo = yield client.ContentObjectMetadata({libraryId, objectId, metadataSubtree: `public/codes/${codeHash}`});

      if(!existingCodeInfo) { throw Error("Unknown access code: " + accessCode); }

      // Update site selector
      const { write_token } = yield client.EditContentObject({libraryId, objectId});

      yield client.DeleteMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree: `public/codes/${codeHash}`
      });

      yield client.FinalizeContentObject({libraryId, objectId, writeToken: write_token, commitMessage: "Remove site access code"});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error:");
      // eslint-disable-next-line no-console
      console.error(error.body ? JSON.stringify(error, null, 2) : error);
      throw error;
    }
  });

  @action.bound
  CreateSiteAccessCode = flow(function * ({accessCode, accountName, accountInfo, siteKey, siteId, existingGroupAddress, newGroupName}) {
    const {libraryId, objectId} = this.rootStore.params;

    try {
      accountInfo = accountInfo ? JSON.parse(accountInfo) : {};

      const client = this.rootStore.client;

      // Generate key hash for quick lookup
      const codeHash = this.Hash(accessCode);

      let existingCodeInfo = yield client.ContentObjectMetadata({libraryId, objectId, metadataSubtree: `public/codes/${codeHash}`});
      if(existingCodeInfo) {
        throw Error("Code already exists");
      }

      // Create client for creating and setting up new account
      const configUrl = yield client.ConfigUrl();
      const newClient = yield ElvClient.FromConfigurationUrl({configUrl});
      const wallet = newClient.GenerateWallet();

      // Create new account
      const newSigner = wallet.AddAccountFromMnemonic({
        mnemonic: yield wallet.GenerateMnemonic()
      });

      // Send funds to new account
      yield client.SendFunds({
        recipient: newSigner.address,
        ether: 2
      });

      // Create the user wallet for the new account
      yield newClient.SetSigner({signer: newSigner});
      yield newClient.userProfileClient.ReplaceUserMetadata({metadataSubtree: "public/name", metadata: accountName});

      // Generate encrypted private key with code
      const encryptedPrivateKey = yield wallet.GenerateEncryptedPrivateKey({
        signer: newSigner,
        password: accessCode,
        options: {scrypt: {N: 16384}}
      });

      // Update site selector
      const { write_token } = yield client.EditContentObject({libraryId, objectId});

      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree: `public/codes/${codeHash}`,
        metadata: {
          info: accountInfo,
          ak: client.utils.B64(encryptedPrivateKey),
          sites: [{
            siteId,
            siteKey
          }]
        }
      });

      yield client.FinalizeContentObject({libraryId, objectId, writeToken: write_token, commitMessage: "Create site access code"});

      // Add user to site group
      let existingGroupName;
      if(existingGroupAddress) {
        yield client.AddAccessGroupMember({contractAddress: existingGroupAddress, memberAddress: newSigner.address});
        const libraryId = (yield client.ContentSpaceId()).replace(/^ispc/, "ilib");
        const objectId = client.utils.AddressToObjectId(existingGroupAddress);
        existingGroupName = yield client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "public/name"
        });
      }

      // Create new group for user
      let newGroupAddress;
      if(newGroupName) {
        newGroupAddress = yield client.CreateAccessGroup({name: newGroupName});
        yield client.AddAccessGroupMember({contractAddress: newGroupAddress, memberAddress: newSigner.address});

        yield client.AddContentObjectGroupPermission({
          groupAddress: newGroupAddress,
          objectId,
          permission: "see"
        });

        yield client.AddContentObjectGroupPermission({
          groupAddress: newGroupAddress,
          objectId,
          permission: "access"
        });

        yield client.AddContentObjectGroupPermission({
          groupAddress: newGroupAddress,
          objectId: siteId,
          permission: "see"
        });

        yield client.AddContentObjectGroupPermission({
          groupAddress: newGroupAddress,
          objectId: siteId,
          permission: "access"
        });
      }

      return {
        accessCode,
        address: newSigner.address,
        privateKey: newSigner.signingKey.privateKey,
        existingGroup: {
          existingGroupName,
          existingGroupAddress,
        },
        newGroup: {
          newGroupName,
          newGroupAddress
        }
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error:");
      // eslint-disable-next-line no-console
      console.error(error.body ? JSON.stringify(error, null, 2) : error);
      throw error;
    }
  });
}

export default FormStore;
