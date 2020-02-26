import {observable, action, flow} from "mobx";

class ContentStore {
  @observable libraries = [];
  @observable objectLists = {};
  @observable objects = {};
  @observable versions = {};

  @observable files = {};
  @observable baseFileUrls = {};
  @observable mimeTypes = {};
  @observable playoutOptions = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  LoadLibraries = flow(function * () {
    if(Object.keys(this.libraries).length > 0) { return; }

    const libraryIds = yield this.rootStore.client.ContentLibraries();

    let libraries = [];
    yield libraryIds.limitedMap(
      5,
      async libraryId => {
        const metadata = await this.rootStore.client.ContentObjectMetadata({
          libraryId,
          objectId: libraryId.replace("ilib", "iq__")
        });

        const name = (metadata.public ? metadata.public.name : metadata.name) || metadata.name || libraryId || "";
        libraries.push({
          id: libraryId,
          libraryId,
          name,
          sortKey: name.startsWith("ilib") ? `zz${name.toLowerCase()}` : name.toLowerCase()
        });
      }
    );

    this.libraries = libraries.sort((a, b) => a.sortKey < b.sortKey ? -1 : 1);
  });

  @action.bound
  LoadObjects = flow(function * (libraryId) {
    if(this.objects[libraryId]) { return; }

    const objectInfo = (
      yield this.rootStore.client.ContentObjects({
        libraryId,
        filterOptions: {
          select: [
            "name",
            "public/name",
            "public/asset_metadata/title",
            "public/asset_metadata/asset_type",
            "public/asset_metadata/title_type"
          ],
          limit: 10000
        }
      })
    ).contents || [];

    let objects = [];
    yield objectInfo.limitedMap(
      5,
      async ({id, versions}) => {
        const metadata = versions[0].meta || {};
        metadata.public = metadata.public || {};

        // TODO: Temporary - Remove when content is fixed
        if((metadata.public.name || "").toLowerCase().startsWith("z_old")) {
          return;
        }

        metadata.public.asset_metadata = metadata.public.asset_metadata || {};
        metadata.public.asset_metadata = {
          ...(metadata.asset_metadata || {}),
          ...metadata.public.asset_metadata
        };

        const name = metadata.public.asset_metadata.title || metadata.public.name || metadata.name || "";

        objects.push({
          id,
          objectId: id,
          name,
          assetType: metadata.public.asset_metadata.asset_type,
          titleType: metadata.public.asset_metadata.title_type,
          sortKey: name.startsWith("iq__") ? `zz${name}` : name
        });
      }
    );

    this.objects[libraryId] = objects.sort((a, b) => a.sortKey < b.sortKey ? -1 : 1);
  });

  @action.bound
  LoadVersions = flow(function * (libraryId, objectId) {
    if(this.versions[objectId]) { return; }

    const versions = (yield this.rootStore.client.ContentObjectVersions({libraryId, objectId})).versions || [];

    this.versions[objectId] = versions.map(({hash}) => ({
      id: hash,
      versionHash: hash,
      name: hash
    }));
  });

  @action.bound
  LoadFiles = flow(function * (versionHash) {
    if(this.files[versionHash]) { return; }

    this.files[versionHash] = (yield this.rootStore.client.ContentObjectMetadata({
      versionHash,
      metadataSubtree: "files"
    })) || {};

    this.mimeTypes[versionHash] = (yield this.rootStore.client.ContentObjectMetadata({
      versionHash,
      metadataSubtree: "mime_types"
    })) || {};

    this.LoadBaseFileUrl(versionHash);
  });

  @action.bound
  LoadBaseFileUrl = flow(function * (versionHash) {
    if(this.baseFileUrls[versionHash]) { return; }

    this.baseFileUrls[versionHash] = (yield this.rootStore.client.FileUrl({
      versionHash,
      filePath: "/"
    }));
  });

  @action.bound
  LoadPlayoutOptions = flow(function * (versionHash) {
    if(this.playoutOptions[versionHash]) { return; }

    this.playoutOptions[versionHash] = (yield this.rootStore.client.PlayoutOptions({
      versionHash,
      linkPath: "public/asset_metadata/sources/default",
      protocols: ["hls"],
      drms: ["aes-128"]
    }));
  });
}

export default ContentStore;
