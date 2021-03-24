import {configure, observable, action, flow, runInAction} from "mobx";

import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import ContentStore from "./Content";
import FormStore from "./Form";
import LiveStore from "./Live";
import ChannelStore from "./Channel";
import SpecStore from "./Spec";
import VoDChannel from "./VoDChannel";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable editingConfiguration = false;

  @observable balance = 0;
  @observable params = {};
  @observable assetMetadata;
  @observable assetName;

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

    this.typeHash = (yield this.client.ContentObject({
      versionHash: this.params.versionHash
    })).type;

    if(this.typeHash) {
      this.typeId = this.client.utils.DecodeVersionHash(this.typeHash).objectId;
      const libraryId = (yield this.client.ContentSpaceId()).replace("ispc", "ilib");

      const {name, title_configuration} = (yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: this.typeId,
        metadataSubtree: "public",
        select: [
          "name",
          "title_configuration"
        ]
      })) || {};

      this.titleConfiguration = title_configuration || {};
      this.typeName = name || this.typeId;

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

  @action.bound
  SetEditingConfiguration(editing) {
    this.editingConfiguration = editing;

    if(editing) {
      this.specStore.InitializeSpec();
    }
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

