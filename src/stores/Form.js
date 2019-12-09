import {observable, action, flow, toJS} from "mobx";
import UrlJoin from "url-join";

class FormStore {
  @observable assetInfo = {};
  @observable clips = [];
  @observable trailers = [];
  @observable images = [];
  @observable gallery = [];
  @observable playlists = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.targets = {};
  }

  CreateLink(versionHash, linkTarget="/meta/asset_metadata") {
    if(versionHash === this.rootStore.params.versionHash) {
      return {
        "/": UrlJoin("./", linkTarget)
      };
    } else {
      return {
        "/": UrlJoin("/qfab", versionHash, linkTarget)
      };
    }
  }

  InitializeFormData = flow(function * () {
    const assetMetadata = this.rootStore.assetMetadata || {};

    this.assetInfo = this.LoadAssetInfo(assetMetadata);

    if(assetMetadata.clips) {
      this.clips = yield this.LoadClips(assetMetadata.clips);
    }

    if(assetMetadata.trailers) {
      this.trailers = yield this.LoadClips(assetMetadata.trailers);
    }

    this.images = yield this.LoadImages(assetMetadata.images, true);
    this.gallery = yield this.LoadGallery(assetMetadata.gallery);
    this.playlists = yield this.LoadPlaylists(assetMetadata.playlists);
  });

  @action.bound
  UpdateAssetInfo(key, value) {
    this.assetInfo[key] = value;
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
      playlistKey: "",
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

  // Load methods
  LoadAssetInfo(metadata) {
    return {
      title: metadata.title || "",
      synopsis: metadata.synopsis || "",
      ip_title_id: metadata.ip_title_id || "",
      title_type: metadata.title_type || "franchise",
      asset_type: metadata.asset_type || "primary"
    };
  }

  // Retrieve information about a clip and add it to targets cache (if not present)
  RetrieveClip = flow(function * (versionHash) {
    const client = this.rootStore.client;

    if(!this.targets[versionHash]) {
      const title =
        (yield client.ContentObjectMetadata({
          versionHash: versionHash,
          metadataSubtree: "asset_metadata/title"
        })) ||
        (yield client.ContentObjectMetadata({
          versionHash: versionHash,
          metadataSubtree: "public/name"
        })) ||
        (yield client.ContentObjectMetadata({
          versionHash: versionHash,
          metadataSubtree: "name"
        }));

      const id = yield client.ContentObjectMetadata({
        versionHash: versionHash,
        metadataSubtree: "asset_metadata/ip_title_id"
      });

      const assetType = yield client.ContentObjectMetadata({
        versionHash: versionHash,
        metadataSubtree: "asset_metadata/asset_type"
      });

      this.targets[versionHash] = {id, assetType, title};
    }
  });

  LoadClips = flow(function * (metadata) {
    let clips = [];
    yield Promise.all(
      Object.keys(metadata).map(async key => {
        const index = parseInt(key);

        if(isNaN(index)) { return; }

        if(!metadata[key] || !metadata[key]["/"]) { return; }

        let targetHash = this.rootStore.params.versionHash;
        if(metadata[key]["/"].startsWith("/qfab/")) {
          targetHash = metadata[key]["/"].split("/")[2];
        }

        await this.RetrieveClip(targetHash);

        clips[index] = {
          versionHash: targetHash,
          ...this.targets[targetHash]
        };
      })
    );

    return clips;
  });

  LoadImages = flow(function * (metadata, includeMandatory=false) {
    let images = [];
    let imageTargets = [];
    if(metadata) {
      Object.keys(metadata).forEach(async imageKey => {
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
        if(images.find(info => info.imageKey === imageKey)) {
          return;
        }

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
        const index = parseInt(imageIndex);

        if(isNaN(index)) { return; }

        const imageInfo = metadata[imageIndex];
        const link = imageInfo.image && imageInfo.image.default;

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

        images[index] = {
          title: imageInfo.title || "",
          description: imageInfo.description || "",
          imagePath,
          targetHash
        };
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
    if(metadata) {
      yield Promise.all(
        Object.keys(metadata).map(async playlistKey => {
          playlists.push({
            playlistKey,
            clips: await this.LoadClips(metadata[playlistKey])
          });
        })
      );
    }

    return playlists;
  });

  @action.bound
  SaveAsset = flow(function * () {
    const client = this.rootStore.client;

    const {libraryId, objectId} = this.rootStore.params;

    const writeToken = (yield client.EditContentObject({
      libraryId,
      objectId
    })).write_token;

    yield client.MergeMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "asset_metadata",
      metadata: toJS(this.assetInfo)
    });

    // Clips
    let clips = {};
    this.clips.forEach(({versionHash}, index) => {
      clips[index.toString()] = this.CreateLink(versionHash);
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "asset_metadata/clips",
      metadata: clips
    });

    // Trailers
    let trailers = {};
    this.trailers.forEach(({versionHash}, index) => {
      trailers[index.toString()] = this.CreateLink(versionHash);
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "asset_metadata/trailers",
      metadata: trailers
    });

    // Images
    let images = {};
    this.images.forEach(({imageKey, imagePath, targetHash}) => {
      if(!imageKey || !imagePath) { return; }

      images[imageKey] = {
        default: this.CreateLink(targetHash, UrlJoin("files", imagePath)),
        "240": this.CreateLink(targetHash, UrlJoin("files", imagePath))
      };
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "asset_metadata/images",
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
      metadataSubtree: "asset_metadata/gallery",
      metadata: gallery
    });

    // Playlists
    let playlists = {};
    this.playlists.forEach(({playlistKey, clips}) => {
      if(!playlistKey) { return; }

      let playlistClips = {};
      clips.forEach(({versionHash}, index) => {
        playlistClips[index.toString()] = this.CreateLink(versionHash);
      });

      playlists[playlistKey] = playlistClips;
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "asset_metadata/playlists",
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
