import {observable, action, flow, toJS} from "mobx";
import UrlJoin from "url-join";

require("elv-components-js/src/utils/LimitedMap");

const Slugify = str =>
  (str || "").toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9\-]/g,"");

class FormStore {
  @observable assetInfo = {};
  @observable images = [];
  @observable gallery = [];
  @observable playlists = [];
  @observable credits = {};

  @observable assets = {};

  @observable assetAssetTypes = [
    "primary",
    "clip",
    "trailer"
  ];

  @observable assetTitleTypes = [
    "collection",
    "episode",
    "feature",
    "franchise",
    "season",
    "series",
    "site"
  ];

  @observable assetImageKeys = [
    "main_slider_background_desktop",
    "main_slider_background_mobile",
    "poster",
    "primary_portrait",
    "primary_landscape",
    "screenshot",
    "thumbnail",
    "slider_background_desktop",
    "slider_background_mobile",
    "title_detail_hero_desktop",
    "title_detail_hero_mobile",
    "title_treatment",
    "title_treatment_wht"
  ];

  @observable assetTypes = [
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
      name: "titles",
      label: "Titles",
      asset_types: ["primary"],
      title_types: ["episode", "feature", "season", "series"],
      indexed: true,
      slugged: true,
      defaultable: false,
      orderable: true
    },
    {
      name: "clips",
      label: "Clips",
      asset_types: ["trailer", "clip"],
      indexed: true,
      slugged: false,
      defaultable: true,
      orderable: true
    },
    {
      name: "trailers",
      label: "Trailers",
      asset_types: ["trailer", "clip"],
      indexed: true,
      slugged: false,
      defaultable: true,
      orderable: true
    }
  ];

  @observable infoFields = [
    {name: "synopsis", type: "textarea"},
    {name: "copyright"},
    {name: "creator"},
    {name: "mgm_internal_rating", label: "MGM Internal Rating"},
    {name: "mpaa_rating", label: "MPAA Rating"},
    {name: "mpaa_rating_reason", label: "MPAA Rating Reason"},
    {name: "original_broadcaster"},
    {name: "number_of_episodes"},
    {name: "number_of_seasons"},
    {name: "runtime", type: "integer"},
    {name: "sales_synopsis", type: "textarea"},
    {name: "sales_tagline"},
    {name: "scripted", type: "checkbox", for_title_types: ["episode", "season", "series"],},
    {name: "tv_rating", label: "TV Rating"},
    {name: "tv_rating_reason", label: "TV Rating Reason"},
  ];

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.targets = {};
    this.linkHashes = {};
  }

  CreateLink(versionHash, linkTarget="/meta/public/asset_metadata", options={}) {
    if(versionHash === this.rootStore.params.versionHash) {
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

  InitializeFormData = flow(function * () {
    const assetMetadata = this.rootStore.assetMetadata || {};

    if(this.rootStore.contentTypeAssetAssetTypes) {
      this.assetAssetTypes = this.rootStore.contentTypeAssetAssetTypes;
    }

    if(this.rootStore.contentTypeAssetTitleTypes) {
      this.assetTitleTypes = this.rootStore.contentTypeAssetTitleTypes;
    }

    if(this.rootStore.contentTypeAssetInfoFields) {
      this.infoFields = this.rootStore.contentTypeAssetInfoFields;
    }

    if(this.rootStore.contentTypeAssetTypes) {
      this.assetTypes = this.rootStore.contentTypeAssetTypes;
    }

    if(this.rootStore.contentTypeAssetImageKeys) {
      this.assetImageKeys = this.rootStore.contentTypeAssetImageKeys;
    }

    this.assetInfo = this.LoadAssetInfo(assetMetadata);
    this.credits = this.LoadCredits((assetMetadata.info || {}).talent);
    this.images = yield this.LoadImages(assetMetadata.images, true);
    this.gallery = yield this.LoadGallery(assetMetadata.gallery);
    this.playlists = yield this.LoadPlaylists(assetMetadata.playlists);

    // Load all clip types
    for(let i = 0; i < this.assetTypes.length; i++) {
      const name = this.assetTypes[i].name;

      this.assets[name] = yield this.LoadAssets(
        assetMetadata[name],
        `public/asset_metadata/${name}`
      );
    }
  });

  @action.bound
  UpdateAssetInfo(key, value) {
    this.assetInfo[key] = value;

    if(key === "display_title") {
      this.assetInfo.slug = Slugify(value);
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

    if(clip.versionHash !== clip.latestVersionHash) {
      yield this.RetrieveAsset(clip.latestVersionHash);
    }

    const updatedClip = {
      ...clip,
      versionHash: clip.latestVersionHash,
      ...this.targets[clip.latestVersionHash]
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

  // Gallery images
  @action.bound
  UpdateGalleryImage({index, title, description, imagePath, targetHash}) {
    this.gallery[index] = {
      title,
      description,
      imagePath,
      targetHash
    };
  }

  @action.bound
  AddGalleryImage() {
    this.gallery.push({
      title: "",
      description: "",
      imagePath: undefined,
      targetHash: this.rootStore.params.versionHash
    });
  }

  @action.bound
  RemoveGalleryImage(index) {
    this.gallery = this.gallery.filter((_, i) => i !== index);
  }

  @action.bound
  SwapGalleryImage(i1, i2) {
    const image = this.gallery[i1];
    this.gallery[i1] = this.gallery[i2];
    this.gallery[i2] = image;
  }

  // Playlists
  @action.bound
  AddPlaylist() {
    this.playlists.push({
      playlistKey: "New Playlist",
      clips: []
    });
  }

  @action.bound
  UpdatePlaylist({index, playlistKey}) {
    this.playlists[index] = {
      ...this.playlists[index],
      playlistKey
    };
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

  // Load methods
  LoadAssetInfo(metadata) {
    const info = (metadata.info || {});

    let release_date = { year: "", month: "", day: ""};
    if(info.release_date) {
      const date = new Date(info.release_date);
      release_date = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate() + 1
      };
    }

    let assetInfo = {
      title: metadata.title || "",
      display_title: metadata.display_title || "",
      slug: metadata.slug || Slugify(metadata.display_title || ""),
      ip_title_id: metadata.ip_title_id || "",
      title_type: metadata.title_type || this.assetTitleTypes[0],
      asset_type: metadata.asset_type || this.assetAssetTypes[0],
      genre: info.genre || [],
      release_date
    };

    this.infoFields.forEach(({name}) => {
      assetInfo[name] = info[name] || "";
    });

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

  RetrieveAssetFromLink = flow(function * (linkPath) {
    if(!this.linkHashes[linkPath]) {
      const metadata = yield (yield this.rootStore.client.ContentObjectMetadata({
        versionHash: this.rootStore.params.versionHash,
        metadataSubtree: linkPath,
        resolveLinks: true,
        resolveIncludeSource: true
      })) || {};

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
        metadataSubtree: "public/asset_metadata"
      })) || {};
    }

    const latestVersionHash = yield this.rootStore.client.LatestVersionHash({versionHash});
    this.targets[versionHash] = {
      id: assetMetadata.ip_title_id,
      assetType: assetMetadata.asset_type,
      title: assetMetadata.title || assetMetadata.display_title,
      displayTitle: assetMetadata.display_title || assetMetadata.title,
      slug: assetMetadata.slug,
      playable: !!(assetMetadata.sources || {}).default,
      latestVersionHash
    };
  });

  LoadAssets = flow(function * (metadata, linkPath) {
    if(!metadata) { return []; }

    let assets = [];
    let unorderedAssets = [];
    let defaultAsset;

    metadata = toJS(metadata);

    // When slugged but not indexed, default choice is duplicated in the 'default' and slug keys.
    if(metadata.default && metadata.default["."]) {
      const dupKey = Object.keys(metadata)
        .find(key => key !== "default" && metadata[key]["."].source === metadata.default["."].source);

      if(dupKey) {
        delete metadata[dupKey];
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

          const targetHash = await this.RetrieveAssetFromLink(UrlJoin(linkPath, key.toString(), slug || ""));

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

          let targetHash = this.rootStore.params.versionHash;
          let imagePath = link["/"].replace(/^\.\/files\//, "");
          if(link["/"].startsWith("/qfab/")) {
            targetHash = link["/"].split("/")[2];
            imagePath = link["/"].split("/").slice(4).join("/");
          }

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

    this.assetImageKeys.forEach(imageKey => {
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

  LoadGallery = flow(function * (metadata) {
    if(!metadata) { return []; }

    let images = [];
    let imageTargets = [];

    Object.keys(metadata).forEach(async imageIndex => {
      try {
        const index = parseInt(imageIndex);

        if(isNaN(index)) { return; }

        const imageInfo = metadata[imageIndex];
        const link = imageInfo.image && imageInfo.image.default;

        if(!link || !link["/"]) { return; }

        let targetHash = this.rootStore.params.versionHash;
        let imagePath = link["/"].replace(/^\.\/files\//, "");
        if(link["/"].startsWith("/qfab/")) {
          targetHash = link["/"].split("/")[2];
          imagePath = link["/"].split("/").slice(4).join("/");
        }

        if(!imageTargets.includes(targetHash)) {
          imageTargets.push(targetHash);
        }

        images[index] = {
          title: imageInfo.title || "",
          description: imageInfo.description || "",
          imagePath,
          targetHash
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load gallery '${imageIndex}':`);
        // eslint-disable-next-line no-console
        console.error(toJS(metadata));
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });

    // Remove any missing entries
    images = images.filter(image => image);

    // Ensure all base URLs are set for previews
    yield Promise.all(
      imageTargets.map(async versionHash =>
        await this.rootStore.contentStore.LoadBaseFileUrl(versionHash)
      )
    );

    return images;
  });

  LoadPlaylists = flow(function * (metadata) {
    if(!metadata) { return []; }

    let playlists = [];
    let unorderedPlaylists = [];
    if(metadata) {
      yield Promise.all(
        Object.keys(metadata).sort().map(async playlistIndex => {
          if(isNaN(parseInt(playlistIndex))) {
            // Old format - playlistIndex is the playlist key
            unorderedPlaylists.push({
              playlistKey: playlistIndex,
              clips: await this.LoadAssets(
                metadata[playlistIndex],
                `public/asset_metadata/playlists/${playlistIndex}`
              )
            });
          } else {
            // Proper format: [index]: { [playlistKey]: ... }
            const playlistKey = Object.keys(metadata[playlistIndex])[0];

            playlists[parseInt(playlistIndex)] = {
              playlistKey,
              clips: await this.LoadAssets(
                metadata[playlistIndex][playlistKey],
                `public/asset_metadata/playlists/${playlistIndex}/${playlistKey}`
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

  FormatDate(date) {
    if(!date.year) { date.year = new Date().getUTCFullYear(); }
    if(!date.month) { date.month = new Date().getMonth() + 1; }
    if(!date.day) { date.day = new Date().getDate() + 1; }

    return `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
  }

  @action.bound
  SaveAsset = flow(function * () {
    try {
      const client = this.rootStore.client;

      const {libraryId, objectId} = this.rootStore.params;

      const writeToken = (yield client.EditContentObject({
        libraryId,
        objectId
      })).write_token;

      if(!writeToken) {
        throw Error("Update request denied");
      }

      // Move fields that belong in the info subtree and remove from main tree
      const assetInfo = toJS(this.assetInfo);

      assetInfo.info = {};
      this.infoFields.forEach(({name, type, for_title_types}) => {
        if(!for_title_types || for_title_types.length == 0 || for_title_types.includes(assetInfo.title_type)) {
          if(type === "integer") {
            assetInfo.info[name] = parseInt(assetInfo[name]);
          } else if(type === "number") {
            assetInfo.info[name] = parseFloat(assetInfo[name]);
          } else {
            assetInfo.info[name] = assetInfo[name];
          }
        }

        delete assetInfo[name];
      });

      // Format release date and move into 'info'
      assetInfo.info.release_date = this.FormatDate(assetInfo.release_date);
      delete assetInfo.release_date;

      // Format genre and remove - will be replaced separately
      let genre = assetInfo.genre;
      genre = genre.filter((a, b) => genre.indexOf(a) === b).sort();

      delete assetInfo.genre;

      // Asset Info
      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata",
        metadata: assetInfo
      });

      // Genre must be replaced, or else it will be merged
      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/info/genre",
        metadata: genre
      });

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

      for(let i = 0; i < this.assetTypes.length; i++) {
        const assetType = this.assetTypes[i];
        const assets = toJS(this.assets[assetType.name]);

        // If not slugged or indexed, asset is saved as array
        let formattedAssets = assetType.indexed || assetType.slugged ? {} : [];
        let index = 0;
        yield Promise.all(
          assets.map(async ({displayTitle, versionHash, isDefault}) => {
            const link = this.CreateLink(versionHash);

            let key;
            if(isDefault) {
              key = "default";
            } else {
              key = index;
              index += 1;
            }

            if(assetType.slugged) {
              const slug = (await client.ContentObjectMetadata({
                versionHash,
                metadataSubtree: UrlJoin("public", "asset_metadata", "slug")
              })) || Slugify(displayTitle);

              if(assetType.indexed) {
                formattedAssets[key] = {
                  [slug]: link
                };
              } else {
                if(isDefault) {
                  formattedAssets.default = this.CreateLink(
                    this.rootStore.params.versionHash,
                    `/meta/public/asset_metadata/${assetType.name}/${slug}`
                  );
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

      // Gallery
      let gallery = {};
      toJS(this.gallery).forEach(({title, description, imagePath, targetHash}, index) => {
        if(!imagePath) {
          return;
        }

        gallery[index.toString()] = {
          title,
          description,
          image: {
            default: this.CreateLink(targetHash, UrlJoin("files", imagePath)),
            thumbnail: this.CreateLink(targetHash, UrlJoin("rep", "thumbnail", "files", imagePath))
          }
        };
      });

      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "public/asset_metadata/gallery",
        metadata: gallery
      });

      // Playlists
      let playlists = {};
      yield Promise.all(
        toJS(this.playlists).map(async ({playlistKey, clips}, index) => {
          if(!playlistKey) {
            return;
          }

          let playlistClips = {};
          await Promise.all(
            clips.map(async ({isDefault, displayTitle, versionHash}, index) => {
              if(isDefault) {
                playlistClips.default = this.CreateLink(versionHash, undefined, {order: index});
              } else {
                const slug = (await client.ContentObjectMetadata({
                  versionHash,
                  metadataSubtree: UrlJoin("public", "asset_metadata", "slug")
                })) || Slugify(displayTitle);

                playlistClips[slug] = this.CreateLink(versionHash, undefined, {order: index});
              }
            })
          );

          playlists[index.toString()] = {
            [playlistKey]: playlistClips
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

      yield client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken
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
}

export default FormStore;
