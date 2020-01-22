import {observable, action, flow, toJS} from "mobx";
import UrlJoin from "url-join";

const Slugify = str =>
  str.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9\-]/g,"");

class FormStore {
  @observable assetInfo = {};
  @observable clips = [];
  @observable trailers = [];
  @observable images = [];
  @observable gallery = [];
  @observable playlists = [];
  @observable titles = [];
  @observable credits = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.targets = {};
  }

  CreateLink(versionHash, linkTarget="/meta/public/asset_metadata") {
    if(versionHash === this.rootStore.params.versionHash) {
      return {
        ".": {"auto_update":{"tag":"latest"}},
        "/": UrlJoin("./", linkTarget)
      };
    } else {
      return {
        ".": {"auto_update":{"tag":"latest"}},
        "/": UrlJoin("/qfab", versionHash, linkTarget)
      };
    }
  }

  InitializeFormData = flow(function * () {
    const assetMetadata = this.rootStore.assetMetadata || {};

    this.assetInfo = this.LoadAssetInfo(assetMetadata);
    this.credits = this.LoadCredits((assetMetadata.info || {}).talent);

    if(assetMetadata.clips) {
      this.clips = yield this.LoadClips(assetMetadata.clips);
    }

    if(assetMetadata.trailers) {
      this.trailers = yield this.LoadClips(assetMetadata.trailers);
    }

    if(assetMetadata.titles) {
      this.titles = yield this.LoadClips(assetMetadata.titles, true);
    }

    this.images = yield this.LoadImages(assetMetadata.images, true);
    this.gallery = yield this.LoadGallery(assetMetadata.gallery);
    this.playlists = yield this.LoadPlaylists(assetMetadata.playlists);
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
    yield this.RetrieveClip(versionHash);

    if(playlistIndex !== undefined) {
      this.playlists[playlistIndex].clips.push({
        versionHash,
        ...this.targets[versionHash]
      });
    } else {
      this[key].push({
        versionHash,
        ...this.targets[versionHash]
      });
    }
  });

  @action.bound
  RemoveClip({key, playlistIndex, index}) {
    if(playlistIndex !== undefined) {
      this.playlists[playlistIndex].clips =
        this.playlists[playlistIndex].clips.filter((_, i) => i !== index);
    } else {
      this[key] = this[key].filter((_, i) => i !== index);
    }
  }

  @action.bound
  SwapClip({key, playlistIndex, i1, i2}) {
    if(playlistIndex !== undefined) {
      const clip = this.playlists[playlistIndex].clips[i1];
      this.playlists[playlistIndex].clips[i1] = this.playlists[playlistIndex].clips[i2];
      this.playlists[playlistIndex].clips[i2] = clip;
    } else {
      const clip = this[key][i1];
      this[key][i1] = this[key][i2];
      this[key][i2] = clip;
    }
  }

  @action.bound
  SetDefaultClip({key, playlistIndex, index}) {
    const clips = playlistIndex !== undefined ?
      this.playlists[playlistIndex].clips :
      this[key];

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
        this[key][toUnset].isDefault = false;
    }

    // Set new default
    if(toUnset !== index) {
      playlistIndex !== undefined ?
        this.playlists[playlistIndex].clips[index].isDefault = true :
        this[key][index].isDefault = true;
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
    return {
      title: metadata.title || "",
      display_title: metadata.display_title || "",
      slug: metadata.slug || Slugify(metadata.display_title || ""),
      synopsis: metadata.synopsis || "",
      ip_title_id: metadata.ip_title_id || "",
      title_type: metadata.title_type || "franchise",
      asset_type: metadata.asset_type || "primary"
    };
  }

  LoadCredits(metadata) {
    if(!metadata) { return []; }

    let credits = [];
    Object.keys(metadata).map(groupName => {
      let withSeqId = [];
      let withoutSeqId = [];

      metadata[groupName].forEach(credit => {
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

  // Retrieve information about a clip and add it to targets cache (if not present)
  RetrieveClip = flow(function * (versionHash) {
    const client = this.rootStore.client;

    if(this.targets[versionHash]) { return; }

    const assetMetadata = (yield client.ContentObjectMetadata({
      versionHash,
      metadataSubtree: "public/asset_metadata"
    })) || {};

    this.targets[versionHash] = {
      id: assetMetadata.ip_title_id,
      assetType: assetMetadata.asset_type,
      title: assetMetadata.title || assetMetadata.display_title,
      displayTitle: assetMetadata.display_title || assetMetadata.title,
      slug: assetMetadata.slug,
      playable: !!(assetMetadata.sources || {}).default
    };
  });

  LoadClips = flow(function * (metadata) {
    let clips = [];
    let unorderedClips = [];
    let defaultClip;

    yield Promise.all(
      Object.keys(metadata).map(async key => {
        try {
          if(!metadata[key]) { return; }

          // Titles have slugs
          // {"0": { "<slug>": { <link> }}} instead of {"0": { <link> }}
          const hasSlug = !metadata[key]["/"];
          const slug = hasSlug ? Object.keys(metadata[key])[0] : undefined;

          let targetHash = this.rootStore.params.versionHash;
          if(hasSlug) {
            if(metadata[key][slug]["/"].startsWith("/qfab/")) {
              targetHash = metadata[key][slug]["/"].split("/")[2];
            }
          } else {
            if(metadata[key]["/"].startsWith("/qfab/")) {
              targetHash = metadata[key]["/"].split("/")[2];
            }
          }

          await this.RetrieveClip(targetHash);

          const clip = {
            versionHash: targetHash,
            isDefault: false,
            ...this.targets[targetHash]
          };

          if(key === "default") {
            clip.isDefault = true;
            defaultClip = clip;
            return;
          }

          // Keys are ordered indices
          const index = parseInt(key);
          if(isNaN(index)) {
            // Key not an index, just add it to the back of the list
            unorderedClips.push(clip);
            return;
          }

          clips[index] = clip;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load clip '${key}':`);
          // eslint-disable-next-line no-console
          console.error(toJS(metadata));
          // eslint-disable-next-line no-console
          console.error(error);
        }
      })
    );

    // Put default at front of list
    if(defaultClip) {
      clips.unshift(defaultClip);
    }

    clips = [
      ...clips,
      ...unorderedClips
    ];

    // Filter any missing indices
    clips = clips.filter(clip => clip);

    return clips;
  });

  LoadImages = flow(function * (metadata, includeMandatory=false) {
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

    if(includeMandatory) {
      const mandatoryImages = [
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

      mandatoryImages.forEach(imageKey => {
        if(images.find(info => info.imageKey === imageKey)) { return; }

        images.push({
          imageKey,
          imagePath: undefined,
          targetHash: this.rootStore.params.versionHash
        });
      });
    }

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
    let images = [];
    let imageTargets = [];
    if(metadata) {
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
    }

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
    let playlists = [];
    let unorderedPlaylists = [];
    if(metadata) {
      yield Promise.all(
        Object.keys(metadata).sort().map(async playlistIndex => {
          if(isNaN(parseInt(playlistIndex))) {
            // Old format - playlistIndex is the playlist key
            unorderedPlaylists.push({
              playlistKey: playlistIndex,
              clips: await this.LoadClips(metadata[playlistIndex], true)
            });
          } else {
            // Proper format: [index]: { [playlistKey]: ... }
            const playlistKey = Object.keys(metadata[playlistIndex])[0];

            playlists[parseInt(playlistIndex)] = {
              playlistKey,
              clips: await this.LoadClips(metadata[playlistIndex][playlistKey], true)
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

  @action.bound
  SaveAsset = flow(function * () {
    const client = this.rootStore.client;

    const {libraryId, objectId} = this.rootStore.params;

    const writeToken = (yield client.EditContentObject({
      libraryId,
      objectId
    })).write_token;

    // Asset Info
    yield client.MergeMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata",
      metadata: toJS(this.assetInfo)
    });

    // Credits
    let credits = {};
    this.credits.map(group => {
      credits[group.group] =
        group.credits.map((credit, index) => ({
          ...credit,
          talent_type: group.talentType,
          talent_note_seq_id: (index + 1).toString().padStart(2, "0")
        }));
    });

    // Asset Info
    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/info/talent",
      metadata: toJS(credits)
    });

    // Clips
    let clips = {};
    let index = 0;
    this.clips.forEach(({isDefault, versionHash}) => {
      if(isDefault) {
        clips.default = this.CreateLink(versionHash);
      } else {
        clips[index.toString()] = this.CreateLink(versionHash);
        index += 1;
      }
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/clips",
      metadata: clips
    });

    // Trailers
    let trailers = {};
    index = 0;
    this.trailers.forEach(({isDefault, versionHash}) => {
      if(isDefault) {
        trailers.default = this.CreateLink(versionHash);
      } else {
        trailers[index.toString()] = this.CreateLink(versionHash);
        index += 1;
      }
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/trailers",
      metadata: trailers
    });

    // Titles
    let titles = {};
    yield Promise.all(
      this.titles.map(async ({displayTitle, versionHash}, index) => {
        const slug = (await client.ContentObjectMetadata({
          versionHash,
          metadataSubtree: UrlJoin("public", "asset_metadata", "slug")
        })) || Slugify(displayTitle);

        titles[index] = {
          [slug]: this.CreateLink(versionHash)
        };
      })
    );

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/titles",
      metadata: titles
    });

    // Images
    let images = {};
    this.images.forEach(({imageKey, imagePath, targetHash}) => {
      if(!imageKey || !imagePath) { return; }

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
    this.gallery.forEach(({title, description, imagePath, targetHash}, index) => {
      if(!imagePath) { return; }

      gallery[index.toString()] = {
        title,
        description,
        image: {
          default: this.CreateLink(targetHash, UrlJoin("files", imagePath)),
          "240": this.CreateLink(targetHash, UrlJoin("files", imagePath))
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
      this.playlists.map(async ({playlistKey, clips}, index) => {
        if(!playlistKey) { return; }

        let playlistClips = {};
        await Promise.all(
          clips.map(async ({isDefault, displayTitle, versionHash}) => {
            if(isDefault) {
              playlistClips.default = this.CreateLink(versionHash);
            } else {
              const slug = (await client.ContentObjectMetadata({
                versionHash,
                metadataSubtree: UrlJoin("public", "asset_metadata", "slug")
              })) || Slugify(displayTitle);

              playlistClips[slug] = this.CreateLink(versionHash);
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
  });
}

export default FormStore;
