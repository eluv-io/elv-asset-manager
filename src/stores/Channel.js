import {action, observable, flow} from "mobx";

class ChannelStore {
  @observable streamLibraryId;
  @observable streamId;
  @observable streamInfo = {};
  @observable streamStatus;
  @observable streamActive = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  Initialize = flow(function * () {
    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    const metadata = (yield client.ContentObjectMetadata({
      libraryId,
      objectId,
      resolveLinks: false,
      metadataSubtree: "public/asset_metadata/channel_info"
    })) || {};

    if(metadata.stream_id) {
      const streamLibraryId = yield client.ContentObjectLibraryId({objectId: metadata.stream_id});
      yield this.RetrieveStreamInfo({streamLibraryId, streamId: metadata.stream_id});
    }
  });

  @action.bound
  StartStream = flow(function * () {
    if(!this.streamId) { return; }

    yield this.rootStore.liveStore.StartStream({
      libraryId: this.streamLibraryId,
      objectId: this.streamId
    });

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.RetrieveStreamInfo({
      streamLibraryId: this.streamLibraryId,
      streamId: this.streamId
    });
  });

  @action.bound
  StopStream = flow(function * () {
    if(!this.streamId) { return; }

    yield this.rootStore.liveStore.StopStream({
      libraryId: this.streamLibraryId,
      objectId: this.streamId
    });

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.RetrieveStreamInfo({
      streamLibraryId: this.streamLibraryId,
      streamId: this.streamId
    });
  });

  @action.bound
  RetrieveStreamInfo = flow(function * ({streamLibraryId, streamId}) {
    this.streamInfo = (yield this.rootStore.client.ContentObjectMetadata({
      libraryId: streamLibraryId,
      objectId: streamId,
      metadataSubtree: "public/asset_metadata"
    })) || {};

    this.streamInfo.originUrl = yield this.rootStore.client.ContentObjectMetadata({
      libraryId: streamLibraryId,
      objectId: streamId,
      metadataSubtree: "origin_url"
    });

    this.streamStatus = yield this.rootStore.liveStore.StreamInfo({
      libraryId: streamLibraryId,
      objectId: streamId
    });

    this.streamActive = !!this.streamStatus;
    this.streamLibraryId = streamLibraryId;
    this.streamId = streamId;
  });

  @action.bound
  UpdateParameter(name, value) {
    this[name] = value;
  }

  @action.bound
  SelectStream = flow(function * ({libraryId, objectId}) {
    this.streamLibraryId = undefined;
    this.streamId = undefined;
    this.streamInfo = undefined;
    this.streamActive = false;

    yield this.RetrieveStreamInfo({streamLibraryId: libraryId, streamId: objectId});
  });

  @action.bound
  SaveChannelInfo = flow(function * ({writeToken}) {
    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/channel_info",
      metadata: {
        stream_id: this.streamId
      }
    });
  });
}

export default ChannelStore;
