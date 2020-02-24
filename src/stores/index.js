import {configure, observable, action, flow, runInAction} from "mobx";

import {FrameClient} from "elv-client-js/src/FrameClient";
import ContentStore from "./Content";
import FormStore from "./Form";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable balance = 0;
  @observable params = {};
  @observable assetMetadata;
  @observable assetName;
  @observable contentTypeAssetInfoFields;
  @observable contentTypeAssetTypes;
  @observable contentTypeAssetImageKeys;

  @observable linkStatus = {
    updatesAvailable: false,
    error: ""
  };

  @observable updating = false;
  @observable updateStatus;

  constructor() {
    this.contentStore = new ContentStore(this);
    this.formStore = new FormStore(this);
  }

  @action.bound
  InitializeClient = flow(function * () {
    this.client = new FrameClient({
      target: window.parent,
      timeout: 30
    });

    this.balance = parseFloat(
      yield this.client.GetBalance({
        address: yield this.client.CurrentAccountAddress()
      })
    );

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
      this.contentTypeAssetInfoFields = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "asset_info_fields"
      });

      this.contentTypeAssetTypes = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "asset_types"
      });

      this.contentTypeAssetImageKeys = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "asset_image_keys"
      });
    }

    yield this.formStore.InitializeFormData();
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

