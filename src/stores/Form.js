import {observable, action, flow, toJS, computed} from "mobx";
import {DateTime} from "luxon";
import {ElvClient} from "@eluvio/elv-client-js";
import UrlJoin from "url-join";

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


class FormStore {
  @observable editWriteToken;

  @observable assetInfo = {};
  @observable localizedAssetInfo = {};
  @observable images = [];
  @observable playlists = [];
  @observable credits = {};

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

  @observable controls = [
    "playlists"
  ];

  @observable fileControls = [];
  @observable fileControlItems = {};

  @observable availableAssetTypes = [
    "primary",
    "clip"
  ];

  @observable availableTitleTypes = [
    "collection",
    "episode",
    "season",
    "series",
    "site",
    "title",
  ];

  @observable defaultImageKeys = [
    "portrait",
    "landscape"
  ];

  @observable localization;
  @observable currentLocalization = [""];

  @observable associatedAssets = [
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
  ];

  @observable infoFields = [
    {name: "release_date", type: "date"},
    {name: "synopsis", type: "textarea"},
    {name: "copyright"},
    {name: "creator"},
    {name: "runtime", type: "integer"},
  ];

  @observable infoFieldLocalizations;

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

  CreateLink(versionHash, linkTarget="/meta/public/asset_metadata", options={}) {
    if(!versionHash || versionHash === this.rootStore.params.versionHash) {
      return {
        ...options,
        ".": {"auto_update":{"tag":"latest"}},
        "/": UrlJoin("./", linkTarget)
      };
    } else {
      return {
        ...options,
        ".": {"auto_update":{"tag":"latest"}},
        "/": UrlJoin("/qfab", versionHash, linkTarget)
      };
    }
  }

  @action.bound
  SetCurrentLocalization(options) {
    this.currentLocalization = options;
    const [l0, l1, l2] = options;

    this.localizedAssetInfo[l0] = this.localizedAssetInfo[l0] || {};
    this.localizedAssetInfo[l0][l1] = this.localizedAssetInfo[l0][l1] || {};

    if(l2) {
      this.localizedAssetInfo[l0][l1][l2] = this.localizedAssetInfo[l0][l1][l2] || {};

      if(!this.localizedAssetInfo[l0][l1][l2]._loaded) {
        this.localizedAssetInfo[l0][l1][l2] =
          this.LoadAssetInfo(this.rootStore.client.utils.SafeTraverse(this.rootStore.assetMetadata, l0, l1, l2));
      }

      this.localizedAssetInfo[l0][l1][l2]._loaded = true;
    } else {
      if(!this.localizedAssetInfo[l0][l1]._loaded) {
        this.localizedAssetInfo[l0][l1] =
          this.LoadAssetInfo(this.rootStore.client.utils.SafeTraverse(this.rootStore.assetMetadata, l0, l1));
      }

      this.localizedAssetInfo[l0][l1]._loaded = true;
    }
  }

  InitializeFormData = flow(function * () {
    const titleConfiguration = this.rootStore.titleConfiguration;

    this.controls = titleConfiguration.controls || this.controls;

    this.fileControls = this.controls.filter(control => typeof control === "object");

    this.availableAssetTypes = titleConfiguration.asset_types || this.availableAssetTypes;
    this.availableTitleTypes = titleConfiguration.title_types || this.availableTitleTypes;
    this.infoFields = titleConfiguration.info_fields || this.infoFields;
    this.infoFieldLocalizations = titleConfiguration.info_field_localizations;
    this.associatedAssets = titleConfiguration.associated_assets || this.associatedAssets;
    this.defaultImageKeys = titleConfiguration.default_image_keys || this.defaultImageKeys;

    this.localization = titleConfiguration.localization;

    const assetMetadata = this.rootStore.assetMetadata || {};

    this.assetInfo = this.LoadAssetInfo(assetMetadata);
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
  });

  @action.bound
  UpdateAssetInfo(key, value) {
    if(this.localizationActive) {
      // Localized asset metadata
      const [l0, l1, l2] = this.currentLocalization;

      if(l2) {
        this.localizedAssetInfo[l0][l1][l2][key] = value;
      } else {
        this.localizedAssetInfo[l0][l1][key] = value;
      }

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

  // Credits

  @action.bound
  AddCreditGroup() {
    this.credits.push({
      group: "",
      talentType: "",
      credits: []
    });
  }

  @action.bound
  RemoveCreditGroup({groupIndex}) {
    this.credits =
      this.credits.filter((_, i) => i !== groupIndex);
  }

  @action.bound
  UpdateCreditGroup({groupIndex, key, value}) {
    this.credits[groupIndex][key] = value;
  }

  @action.bound
  AddCredit({groupIndex}) {
    this.credits[groupIndex].credits.push({
      character_name: "",
      talent_first_name: "",
      talent_last_name: ""
    });
  }

  @action.bound
  UpdateCredit({groupIndex, creditIndex, key, value}) {
    this.credits[groupIndex].credits[creditIndex][key] = value;
  }

  @action.bound
  SwapCredit({groupIndex, i1, i2}) {
    const credit = this.credits[groupIndex].credits[i1];
    this.credits[groupIndex].credits[i1] = this.credits[groupIndex].credits[i2];
    this.credits[groupIndex].credits[i2] = credit;
  }

  @action.bound
  RemoveCredit({groupIndex, creditIndex}) {
    this.credits[groupIndex].credits =
      this.credits[groupIndex].credits.filter((_, i) => i !== creditIndex);
  }

  // Clips/trailers
  @action.bound
  AddClip = flow(function * ({key, playlistIndex, versionHash}) {
    yield this.RetrieveAsset(versionHash);

    if(playlistIndex !== undefined) {
      // Prevent duplicates
      if(this.playlists[playlistIndex].clips.find(clip => clip.versionHash === versionHash)) {
        return;
      }

      this.playlists[playlistIndex].clips.push({
        versionHash,
        ...this.targets[versionHash]
      });
    } else {
      // Prevent duplicates
      if(this.assets[key].find(clip => clip.versionHash === versionHash)) {
        return;
      }

      this.assets[key].push({
        versionHash,
        ...this.targets[versionHash]
      });
    }
  });

  @action.bound
  UpdateClip = flow(function * ({key, playlistIndex, index}) {
    let clip;
    if(playlistIndex !== undefined) {
      clip = this.playlists[playlistIndex].clips[index];
    } else {
      clip = this.assets[key][index];
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
      this.playlists[playlistIndex].clips[index] = updatedClip;
    } else {
      this.assets[key][index] = updatedClip;
    }
  });

  @action.bound
  RemoveClip({key, playlistIndex, index}) {
    if(playlistIndex !== undefined) {
      this.playlists[playlistIndex].clips =
        this.playlists[playlistIndex].clips.filter((_, i) => i !== index);
    } else {
      this.assets[key] = this.assets[key].filter((_, i) => i !== index);
    }
  }

  @action.bound
  SwapClip({key, playlistIndex, i1, i2}) {
    if(playlistIndex !== undefined) {
      const clip = this.playlists[playlistIndex].clips[i1];
      this.playlists[playlistIndex].clips[i1] = this.playlists[playlistIndex].clips[i2];
      this.playlists[playlistIndex].clips[i2] = clip;
    } else {
      const clip = this.assets[key][i1];
      this.assets[key][i1] = this.assets[key][i2];
      this.assets[key][i2] = clip;
    }
  }

  @action.bound
  SetDefaultClip({key, playlistIndex, index}) {
    const clips = playlistIndex !== undefined ?
      this.playlists[playlistIndex].clips :
      this.assets[key];

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
        this.playlists[playlistIndex].clips[toUnset].isDefault = false :
        this.assets[key][toUnset].isDefault = false;
    }

    // Set new default
    if(toUnset !== index) {
      playlistIndex !== undefined ?
        this.playlists[playlistIndex].clips[index].isDefault = true :
        this.assets[key][index].isDefault = true;
    }
  }

  // Images
  @action.bound
  UpdateImage({index, imageKey, imagePath, targetHash}) {
    this.images[index] = {
      imageKey,
      imagePath,
      targetHash
    };
  }

  @action.bound
  AddImage() {
    this.images.push({
      imageKey: "",
      imagePath: undefined,
      targetHash: this.rootStore.params.versionHash
    });
  }

  @action.bound
  RemoveImage(index) {
    this.images = this.images.filter((_, i) => i !== index);
  }

  // Configurable File Items
  @action.bound
  UpdateFileControlItem({index, controlName, title, description, path, targetHash}) {
    this.fileControlItems[controlName][index] = {
      title,
      description,
      path,
      targetHash
    };
  }

  @action.bound
  AddFileControlItem({controlName}) {
    this.fileControlItems[controlName].push({
      title: "",
      description: "",
      path: undefined,
      targetHash: this.rootStore.params.versionHash
    });
  }

  @action.bound
  RemoveFileControlItem({controlName, index}) {
    this.fileControlItems[controlName] = this.fileControlItems[controlName].filter((_, i) => i !== index);
  }

  @action.bound
  SwapFileControlItem(controlName, i1, i2) {
    const image = this.fileControlItems[controlName][i1];
    this.fileControlItems[controlName][i1] = this.fileControlItems[controlName][i2];
    this.fileControlItems[controlName][i2] = image;
  }

  // Playlists
  @action.bound
  AddPlaylist() {
    this.playlists.push({
      playlistId: `playlist-${Id.next()}`,
      playlistName: "New Playlist",
      playlistSlug: "new-playlist",
      clips: []
    });
  }

  @action.bound
  UpdatePlaylist({index, key, value}) {
    this.playlists[index][key] = value;
  }

  @action.bound
  RemovePlaylist(index) {
    this.playlists = this.playlists.filter((_, i) => i !== index);
  }

  @action.bound
  SwapPlaylist(i1, i2) {
    const playlist = this.playlists[i1];
    this.playlists[i1] = this.playlists[i2];
    this.playlists[i2] = playlist;
  }

  LoadInfoFields({infoFields, values, isTopLevel=false, topLevelValues}) {
    let info = {};
    infoFields.forEach(({name, type, top_level, fields}) => {
      if(isTopLevel && top_level) {
        info[name] = topLevelValues[name] || "";
      } else {
        info[name] = values[name] || "";
      }

      if((type === "date" || type === "datetime") && info[name]) {
        const date = DateTime.fromISO(values[name]);

        if(!date || date.invalid) {
          info[name] = undefined;
        } else {
          info[name] = date.ts;
        }
      } else if(type === "list" && info[name]) {
        info[name] = (info[name] || []).map(listValues =>
          this.LoadInfoFields({infoFields: fields, values: listValues})
        );
      }
    });

    return info;
  }

  // Load methods
  LoadAssetInfo(metadata) {
    metadata = metadata || {};

    const info = (metadata.info || {});

    let assetInfo = {
      title: metadata.title || "",
      display_title: metadata.display_title || "",
      slug: metadata.slug || Slugify(metadata.display_title || ""),
      ip_title_id: metadata.ip_title_id || "",
      title_type: metadata.title_type || this.availableTitleTypes[0],
      asset_type: metadata.asset_type || this.availableAssetTypes[0]
    };

    this.originalSlug = assetInfo.slug;

    const loadedInfo = this.LoadInfoFields({
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
  }

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
      if(!metadata) {
        metadata = yield (yield this.rootStore.client.ContentObjectMetadata({
          versionHash: this.rootStore.params.versionHash,
          metadataSubtree: linkPath,
          resolveLinks: true,
          resolveIncludeSource: true
        })) || {};
      }

      this.linkHashes[linkPath] = metadata["."].source;

      // Cache metadata
      yield this.RetrieveAsset(this.linkHashes[linkPath], metadata);
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

  LinkComponents(link) {
    if(!link || !link["/"]) {
      return;
    }

    let targetHash = this.rootStore.params.versionHash;
    let path = link["/"].replace(/^\.\/files\//, "");
    if(link["/"].startsWith("/qfab/")) {
      targetHash = link["/"].split("/")[2];
      path = link["/"].split("/").slice(4).join("/");
    }

    return {targetHash, path, imagePath: path};
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
    const metadata = (yield this.rootStore.client.ContentObjectMetadata({
      versionHash: this.rootStore.params.versionHash,
      metadataSubtree: control.target
    })) || [];

    let items = [];
    let itemTargets = [];

    Object.keys(metadata).forEach(async index => {
      try {
        index = parseInt(index);

        if(isNaN(index)) { return; }

        const info = metadata[index];

        let link = info[control.linkKey || "file"];
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
            // New format - [playlistSlug]: { ... }
            const playlist = {
              playlistId: `playlist-${Id.next()}`,
              playlistName: metadata[playlistIndex].name || "",
              playlistSlug: playlistIndex,
              clips: await this.LoadAssets(
                metadata[playlistIndex].list,
                `public/asset_metadata/playlists/${playlistIndex}/list`,
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

            playlists[parseInt(playlistIndex)] = {
              playlistName: playlistSlug || "",
              playlistSlug,
              clips: await this.LoadAssets(
                metadata[playlistIndex][playlistSlug],
                `public/asset_metadata/playlists/${playlistIndex}/${playlistSlug}`
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
      (assets || []).map(async ({displayTitle, versionHash, isDefault, slug}) => {
        const link = this.CreateLink(versionHash);

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
              formattedAssets.default = this.CreateLink(
                this.rootStore.params.versionHash,
                `/meta/public/asset_metadata/${assetType.name}/${slug}`,
                { order: 0 }
              );
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

  FormatFields({infoFields, values, titleType, isTopLevel=false, splitListFields=true}) {
    let topInfo = {};
    let info = {};
    let listFields = [];

    infoFields.forEach(({name, type, for_title_types, top_level, fields}) => {
      if(for_title_types && !for_title_types.includes(titleType)) { return; }

      let value = values[name];
      if(type === "integer") {
        value = parseInt(values[name]);
      } else if(type === "number") {
        value = parseFloat(values[name]);
      } else if(type === "date") {
        value = this.FormatDate(values[name]);
      } else if(type === "datetime") {
        value = this.FormatDate(values[name], true);
      } else if(type === "list") {
        value = (value || []).map(entry => {
          entry = toJS(entry);

          return (this.FormatFields({infoFields: fields, values: entry, titleType})).info;
        });
      }

      value = toJS(value);

      if(!isTopLevel) {
        info[name] = value;
      } else {
        if(splitListFields && (type === "list" || type === "multiselect")) {
          // List type - Since we're doing a merge on the info metadata, we must do an explicit replace call to modify lists
          listFields.push({name, value, top_level});
        } else if(top_level) {
          // Top level specified, keep value at root level `public/asset_metadata/
          topInfo[name] = value;
        } else {
          // Default case - field is in info
          info[name] = value;
        }
      }
    });

    return { info, topInfo, listFields };
  }

  FormatLocalizedFields(localizedAssetInfo) {
    const {info, topInfo} = this.FormatFields({
      infoFields: this.infoFields,
      values: localizedAssetInfo,
      titleType: this.assetInfo.title_type,
      isTopLevel: true,
      splitListFields: false
    });

    // Move built-in fields to top level info
    ["title", "display_title", "ip_title_id", "slug", "title_type", "asset_type"]
      .forEach(attr => topInfo[attr] = localizedAssetInfo[attr]);

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

    return {
      info,
      topInfo
    };
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

      if(this.HasControl("live_stream")) {
        yield this.rootStore.liveStore.SaveLiveParameters({writeToken});
      }

      if(this.HasControl("channel")) {
        yield this.rootStore.channelStore.SaveChannelInfo({writeToken});
      }

      // Format asset info
      const assetInfo = toJS(this.assetInfo);
      const {info, topInfo, listFields} = this.FormatFields({
        infoFields: this.infoFields,
        values: assetInfo,
        titleType: assetInfo.title_type,
        isTopLevel: true
      });

      // Move built-in fields to top level info
      ["title", "display_title", "ip_title_id", "slug", "title_type", "asset_type"]
        .forEach(attr => topInfo[attr] = assetInfo[attr]);

      // Asset Info
      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/info",
        metadata: info
      });

      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata",
        metadata: topInfo
      });

      // List types must be replaced, or else they will be merged
      yield Promise.all(
        listFields.map(async ({name, value, top_level}) => {
          await client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: top_level ? `public/asset_metadata/${name}` : `public/asset_metadata/info/${name}`,
            metadata: value
          });
        })
      );

      // Localized asset info
      for(let l0 of Object.keys(this.localizedAssetInfo)) {
        for(let l1 of Object.keys(this.localizedAssetInfo[l0])) {
          if(this.localizedAssetInfo[l0][l1]._loaded) {
            const {info, topInfo} = this.FormatLocalizedFields(this.localizedAssetInfo[l0][l1]);

            yield client.ReplaceMetadata({
              libraryId,
              objectId,
              writeToken,
              metadataSubtree: UrlJoin("public", "asset_metadata", l0, l1),
              metadata: {
                ...topInfo,
                info
              }
            });
          } else {
            for(let l2 of Object.keys(this.localizedAssetInfo[l0][l1])) {
              const {info, topInfo} = this.FormatLocalizedFields(this.localizedAssetInfo[l0][l1][l2]);

              yield client.ReplaceMetadata({
                libraryId,
                objectId,
                writeToken,
                metadataSubtree: UrlJoin("public", "asset_metadata", l0, l1, l2),
                metadata: {
                  ...topInfo,
                  info
                }
              });
            }
          }
        }
      }

      // Credits
      let credits = {};
      toJS(this.credits).map(group => {
        credits[group.group] =
          group.credits.map((credit, index) => ({
            ...credit,
            talent_type: group.talentType,
            talent_note_seq_id: (index + 1).toString().padStart(2, "0"),
            sales_display_order: credit.sales_display_order ?
              credit.sales_display_order.padStart(2, "0") : ""
          }));
      });

      // Asset Info
      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/info/talent",
        metadata: credits
      });

      for(let i = 0; i < this.associatedAssets.length; i++) {
        const assetType = this.associatedAssets[i];
        const assets = toJS(this.assets[assetType.name]);

        const formattedAssets = yield this.FormatAssets({assetType, assets});

        yield client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: `public/asset_metadata/${assetType.name}`,
          metadata: formattedAssets
        });
      }

      // Images
      let images = {};
      toJS(this.images).forEach(({imageKey, imagePath, targetHash}) => {
        if(!imageKey || !imagePath) {
          return;
        }

        images[imageKey] = {
          default: this.CreateLink(targetHash, UrlJoin("files", imagePath)),
          thumbnail: this.CreateLink(targetHash, UrlJoin("rep", "thumbnail", "files", imagePath))
        };
      });

      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/images",
        metadata: images
      });

      // Configurable Controls
      for(let i = 0; i < this.fileControls.length; i++) {
        const control = this.fileControls[i];

        let items = {};
        toJS(this.fileControlItems[control.name]).forEach(({title, description, path, targetHash}, index) => {
          if(!path) {
            return;
          }

          let file;
          if(control.thumbnail) {
            file = {
              default: this.CreateLink(targetHash, UrlJoin("files", path)),
              thumbnail: this.CreateLink(targetHash, UrlJoin("rep", "thumbnail", "files", path))
            };
          } else {
            file = this.CreateLink(targetHash, UrlJoin("files", path));
          }

          items[index.toString()] = {
            title,
            description,
            [control.linkKey || "file"]: file
          };
        });

        yield client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: control.target,
          metadata: items
        });
      }

      // Playlists
      let playlists = {};
      yield Promise.all(
        toJS(this.playlists).map(async ({playlistName, playlistSlug, clips}, index) => {
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

      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/playlists",
        metadata: playlists
      });

      if(this.HasControl("site_customization")) {
        let siteCustomization = {...toJS(this.siteCustomization)};

        if(siteCustomization.logo && siteCustomization.logo.targetHash && siteCustomization.logo.imagePath) {
          siteCustomization.logo = this.CreateLink(siteCustomization.logo.targetHash, UrlJoin("files", siteCustomization.logo.imagePath));
        }

        if(siteCustomization.dark_logo && siteCustomization.dark_logo.targetHash && siteCustomization.dark_logo.imagePath) {
          siteCustomization.dark_logo = this.CreateLink(siteCustomization.dark_logo.targetHash, UrlJoin("files", siteCustomization.dark_logo.imagePath));
        }

        if(siteCustomization.background_image && siteCustomization.background_image.targetHash && siteCustomization.background_image.imagePath) {
          siteCustomization.background_image = this.CreateLink(siteCustomization.background_image.targetHash, UrlJoin("files", siteCustomization.background_image.imagePath));
        }

        siteCustomization.arrangement = this.siteCustomization.arrangement.map(entry => {
          entry = {...toJS(entry)};
          if(entry.type === "playlist") {
            const playlist = this.playlists.find(playlist => playlist.playlistId === entry.playlistId);
            entry.playlist_slug = playlist.playlistSlug;
            entry.name = "playlist";
            delete entry.playlistId;
          } else if(entry.title) {
            entry.title = this.CreateLink(entry.title.versionHash);
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

            siteCustomization.premiere.title = this.CreateLink(siteCustomization.premiere.title.versionHash);
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
          message: "Successfully Updated Asset"
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
