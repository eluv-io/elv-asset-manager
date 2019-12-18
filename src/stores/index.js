import {configure, observable, action, flow} from "mobx";

import {FrameClient} from "elv-client-js/src/FrameClient";
import ContentStore from "./Content";
import FormStore from "./Form";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable client;
  @observable balance = 0;
  @observable params = {};
  @observable assetMetadata;
  @observable assetName;

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
        metadataSubtree: "public/asset_metadata",
        resolveLinks: false
      })) || {};

    yield this.formStore.InitializeFormData();
  })
}

export const rootStore = new RootStore();
export const contentStore = rootStore.contentStore;
export const formStore = rootStore.formStore;

