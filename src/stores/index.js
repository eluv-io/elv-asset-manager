import {configure, observable, action, flow, runInAction} from "mobx";

import {FrameClient} from "elv-client-js/src/FrameClient";
import ContentStore from "./Content";
import FormStore from "./Form";
import LiveStore from "./Live";
import ChannelStore from "./Channel";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable balance = 0;
  @observable params = {};
  @observable assetMetadata;
  @observable assetName;
  @observable titleConfiguration = {};

  @observable linkStatus = {
    updatesAvailable: false,
    error: ""
  };

  @observable updating = false;
  @observable updateStatus;

  constructor() {
    this.contentStore = new ContentStore(this);
    this.formStore = new FormStore(this);
    this.liveStore = new LiveStore(this);
    this.channelStore = new ChannelStore(this);
  }

  @action.bound
  InitializeClient = flow(function * () {
    this.client = new FrameClient({
      target: window.parent,
      timeout: 30
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

    this.assetMetadata =
      (yield this.client.ContentObjectMetadata({
        versionHash: this.params.versionHash,
        metadataSubtree: "public/asset_metadata"
      })) || {};

    const typeHash = (yield this.client.ContentObject({
      versionHash: this.params.versionHash
    })).type;

    if(typeHash) {
      const libraryId = (yield this.client.ContentSpaceId()).replace("ispc", "ilib");
      const objectId = this.client.utils.DecodeVersionHash(typeHash).objectId;

      this.titleConfiguration = (yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "public/title_configuration"
      })) || {};
    }

    yield this.formStore.InitializeFormData();

    if(this.formStore.HasControl("live_stream")) {
      yield this.liveStore.Initialize();
    }

    if(this.formStore.HasControl("channel")) {
      yield this.channelStore.Initialize();
    }
  });

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
}

export const rootStore = new RootStore();
export const contentStore = rootStore.contentStore;
export const formStore = rootStore.formStore;
export const liveStore = rootStore.liveStore;
export const channelStore = rootStore.channelStore;

