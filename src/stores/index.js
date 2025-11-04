import {configure, observable, action, flow, runInAction} from "mobx";

import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import ContentStore from "./Content";
import FormStore from "./Form";
import LiveStore from "./Live";
import ChannelStore from "./Channel";
import SpecStore from "./Spec";
import VoDChannel from "./VoDChannel";

import UrlJoin from "url-join";
import Utils from "@eluvio/elv-client-js/src/Utils";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable editingConfiguration = false;

  @observable networkInfo;

  @observable balance = 0;
  @observable params = {};
  @observable assetMetadata;
  @observable assetName;

  @observable nonStandardFields = [];
  @observable otherMetadata = {};

  @observable typeId = "";
  @observable typeHash = "";
  @observable typeName = "";
  @observable canEditType = false;

  @observable titleConfiguration = {};

  @observable linkStatus = {
    updatesAvailable: false,
    error: ""
  };

  @observable updating = false;
  @observable updateStatus;

  @observable message = {};

  constructor() {
    this.channelStore = new ChannelStore(this);
    this.contentStore = new ContentStore(this);
    this.formStore = new FormStore(this);
    this.liveStore = new LiveStore(this);
    this.specStore = new SpecStore(this);
    this.vodChannelStore = new VoDChannel(this);

    window.rootStore = this;
  }

  @action.bound
  InitializeClient = flow(function * () {
    this.client = new FrameClient({
      target: window.parent,
      timeout: 240
    });

    let queryParams = window.location.search.split("?")[1];
    queryParams = queryParams.split("&");
    queryParams.forEach(param => {
      const [key, value] = param.split("=");
      this.params[key] = value;
    });

    if(!this.params.libraryId) {
      throw Error("Missing query parameter 'libraryId'");
    } else if(!this.params.objectId) {
      throw Error("Missing query parameter 'objectId'");
    } else if(!this.params.versionHash) {
      throw Error("Missing query parameter 'versionHash'");
    }

    this.networkInfo = yield this.client.NetworkInfo();

    this.assetName =
      (yield this.client.ContentObjectMetadata({
        versionHash: this.params.versionHash,
        metadataSubtree: "public/asset_metadata/title",
        resolveLinks: true
      })) ||
      (yield this.client.ContentObjectMetadata({
        versionHash: this.params.versionHash,
        metadataSubtree: "public/name",
        resolveLinks: true
      })) ||
      (yield this.client.ContentObjectMetadata({
        versionHash: this.params.versionHash,
        metadataSubtree: "name",
        resolveLinks: true
      })) || "";

    this.typeHash = (yield this.client.ContentObject({
      versionHash: this.params.versionHash
    })).type;

    if(this.typeHash) {
      this.typeId = this.client.utils.DecodeVersionHash(this.typeHash).objectId;
      const libraryId = (yield this.client.ContentSpaceId()).replace("ispc", "ilib");

      let typeMetadata;
      try {
        typeMetadata = (yield this.client.ContentObjectMetadata({
          libraryId,
          objectId: this.typeId,
          select: [
            "bitcode_flags",
            "bitcode_format",
            "public/eluv.displayApp",
            "public/eluv.manageApp",
            "public/name",
            "public/title_configuration"
          ]
        })) || {};
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Unable to load private metadata for type: ${this.typeId}. Loading public metadata.`);
        const publicMetadata = (yield this.client.ContentObjectMetadata({
          libraryId,
          objectId: this.typeId,
          publicOnly: true,
          metadataSubtree: "public",
          select: [
            "eluv.displayApp",
            "eluv.manageApp",
            "name",
            "title_configuration"
          ]
        })) || {};

        typeMetadata = {
          public: publicMetadata
        };
      }

      typeMetadata.public = typeMetadata.public || {};

      this.titleConfiguration = typeMetadata.public.title_configuration || {};
      this.titleConfiguration.playable = typeMetadata.bitcode_flags === "abrmaster" && typeMetadata.bitcode_format === "builtin";
      this.titleConfiguration.displayApp = typeMetadata.public["eluv.displayApp"];
      this.titleConfiguration.manageApp = typeMetadata.public["eluv.manageApp"];

      this.typeName = typeMetadata.public.name || this.typeId;

      this.nonStandardFields = (this.titleConfiguration.info_fields || []).filter(field => field.path);

      let metadata =
        (yield this.client.ContentObjectMetadata({
          versionHash: this.params.versionHash,
          select: [
            "public/asset_metadata",
            ...(this.nonStandardFields.map(field => field.path)),
            "site_map/searchables"
          ]
        })) || {};
      metadata.public = metadata.public || {};
      metadata.public.asset_metadata = metadata.public.asset_metadata || {};
      metadata.searchables = metadata.site_map?.searchables || {};

      this.assetMetadata = { ...metadata.public.asset_metadata };
      delete metadata.public.asset_metadata;
      this.otherMetadata = metadata;

      if(metadata.site_map) {
        delete metadata.site_map;
      }

      try {
        this.canEditType = yield this.client.CallContractMethod({
          contractAddress: this.client.utils.HashToAddress(this.typeId),
          methodName: "canEdit"
        });
      } catch (error) {
        const owner = yield this.client.ContentObjectOwner({objectId: this.typeId});

        this.canEditType = this.client.utils.EqualAddress(owner, yield this.client.CurrentAccountAddress());
      }
    }

    this.specStore.InitializeSpec();
    yield this.formStore.InitializeFormData();

    if(this.formStore.HasControl("live_stream")) {
      yield this.liveStore.Initialize();
    }

    if(this.formStore.HasControl("channel")) {
      yield this.channelStore.Initialize();
    }
  });

  @action.bound
  SetMessage(message) {
    this.message = { message, key: Math.random() };
  }

  @action.bound
  LinkStatus = flow(function * () {
    try {
      const status = yield this.client.ContentObjectGraph({
        libraryId: this.params.libraryId,
        versionHash: this.params.versionHash,
        autoUpdate: true
      });

      this.linkStatus = {
        updatesAvailable: Object.keys(status.auto_updates).length > 0,
        error: ""
      };
    } catch (error) {
      this.linkStatus.error = error.toString();
    }
  });

  @action.bound
  UpdateLinks = flow(function * () {
    try {
      this.updating = true;
      this.updateStatus = {};

      const callback = ({total, completed, action}) => {
        runInAction(() => this.updateStatus = {total, completed, action});
      };

      yield this.client.UpdateContentObjectGraph({
        libraryId: this.params.libraryId,
        versionHash: this.params.versionHash,
        callback
      });

      this.updateStatus.completed = this.updateStatus.total;
      this.updateStatus.action = "Done";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during link updates:");
      // eslint-disable-next-line no-console
      console.error(error);
      this.updateStatus.error = error.message ? error.message : error;
    } finally {
      this.updating = false;
    }
  });

  SelfEmbedUrl(version=false, options) {
    let embedUrl = new URL("https://embed.v3.contentfabric.io");

    embedUrl.searchParams.set("p", "");
    embedUrl.searchParams.set("net", this.networkInfo.name === "demov3" ? "demo" : this.networkInfo.name);

    if(version) {
      embedUrl.searchParams.set("vid", this.params.versionHash);
    } else {
      embedUrl.searchParams.set("oid", this.params.objectId);
    }

    if(
      options.check_has_audio_flag &&
      (
        Utils.SafeTraverse(this.formStore.assetInfo, "nft", "has_audio") ||
        Utils.SafeTraverse(this.assetMetadata, "nft", "has_audio")
      )
    ) {
      // NFT has audio, set to autohide controls, audio enabled, autoplay off
      embedUrl.searchParams.set("ct", "h");
    } else {
      if(options.muted) {
        embedUrl.searchParams.set("m", "");
      }

      if(!options.hide_controls) {
        embedUrl.searchParams.set("ct", "h");
      }

      if(options.autoplay) {
        embedUrl.searchParams.set("ap", "");
      }
    }

    if(options.loop) {
      embedUrl.searchParams.set("lp", "");
    }

    return embedUrl.toString();
  }

  SelfMetadataUrl(path) {
    const net = this.networkInfo.name === "demov3" ? "demo" : this.networkInfo.name;

    let url;
    switch (net) {
      case "main":
        url = "https://main.net955305.contentfabric.io/s/main";
        break;
      case "demo":
        url = "https://demov3.net955210.contentfabric.io/s/demov3";
        break;
      case "test":
        url = "https://test.net955210.contentfabric.io/s/test";
        break;
    }

    return UrlJoin(url, "q", this.params.versionHash, "meta", path);
  }

  @action.bound
  SetEditingConfiguration(editing) {
    this.editingConfiguration = editing;

    if(editing) {
      this.specStore.InitializeSpec();
    }

    window.scrollTo(0, 0);
  }

  @action.bound
  OpenObjectLink({libraryId, objectId, versionHash}) {
    this.client.SendMessage({
      options: {
        operation: "OpenLink",
        libraryId,
        objectId,
        versionHash
      },
      noResponse: true
    });
  }
}

export const rootStore = new RootStore();
export const contentStore = rootStore.contentStore;
export const formStore = rootStore.formStore;
export const liveStore = rootStore.liveStore;
export const channelStore = rootStore.channelStore;
export const specStore = rootStore.specStore;
export const vodChannelStore = rootStore.vodChannelStore;

