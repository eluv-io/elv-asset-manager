import {observable, action, flow} from "mobx";

class ContentStore {
  @observable libraries = [];
  @observable objectLists = {};
  @observable objects = {};
  @observable versions = {};
  @observable offerings = {};

  @observable objectsPerPage = 100;
  @observable objectPaginationInfo = {};

  @observable files = {};
  @observable baseFileUrls = {};
  @observable mimeTypes = {};
  @observable playoutOptions = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  LoadLibraries = flow(function * () {
    if(this.libraries.length > 0) { return; }

    const libraryIds = yield this.rootStore.client.ContentLibraries();

    let libraries = [];
    yield libraryIds.limitedMap(
      5,
      async libraryId => {
        try {
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
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to load library " + libraryId);
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    );

    this.libraries = libraries.sort((a, b) => a.sortKey < b.sortKey ? -1 : 1);
  });

  @action.bound
  LoadObjects = flow(function * ({libraryId, page=1, filter=""}) {
    const limit = this.objectsPerPage;
    const start = (page - 1) * limit;

    const results = (
      yield this.rootStore.client.ContentObjects({
        libraryId,
        filterOptions: {
          filter: !filter ? undefined : {
            key: "public/asset_metadata/title",
            type: "cnt",
            filter
          },
          select: [
            "public/name",
            "public/description",
            "public/asset_metadata/title",
            "public/asset_metadata/display_title",
            "public/asset_metadata/asset_type",
            "public/asset_metadata/title_type",
            "public/asset_metadata/ip_title_id",
            "public/asset_metadata/slug"
          ],
          sort: "public/asset_metadata/title",
          start,
          limit
        }
      })
    ) || {};

    let objects = [];
    yield (results.contents || []).limitedMap(
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

        const name =
          metadata.public.asset_metadata.title ||
          metadata.public.asset_metadata.display_title ||
          metadata.public.name ||
          metadata.name ||
          "";

        objects.push({
          id,
          objectId: id,
          name,
          slug: metadata.public.asset_metadata.slug,
          ipTitleId: metadata.public.asset_metadata.ip_title_id,
          objectName: metadata.public.name,
          objectDescription: metadata.public.description,
          assetType: metadata.public.asset_metadata.asset_type,
          titleType: metadata.public.asset_metadata.title_type,
          sortKey: name.startsWith("iq__") ? `zz${name}` : name
        });
      }
    );

    this.objects[libraryId] = objects.sort((a, b) => a.sortKey < b.sortKey ? -1 : 1);
    this.objectPaginationInfo[libraryId] = results.paging;
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
  LoadOfferings = flow(function * (objectId, versionHash) {
    const offerings = yield this.rootStore.client.AvailableOfferings({
      objectId,
      versionHash
    });

    this.offerings[objectId] = Object.keys(offerings).map(offeringKey => ({
      id: offeringKey,
      name: offerings[offeringKey].display_name || offeringKey,
      objectDescription: offerings[offeringKey].description,
      sortKey: offeringKey
    }));
  });

  async LatestVersionHash({objectId, versionHash}) {
    return await this.rootStore.client.LatestVersionHash({objectId, versionHash});
  }

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
  LoadPlayoutOptions = flow(function * ({objectId, versionHash}) {
    if(!versionHash) {
      versionHash = yield this.rootStore.client.LatestVersionHash({objectId});
    }

    if(!this.playoutOptions[versionHash]) {
      this.playoutOptions[versionHash] = (yield this.rootStore.client.PlayoutOptions({
        versionHash,
        protocols: ["hls"],
        drms: ["aes-128"]
      }));
    }

    return versionHash;
  });

  @action.bound
  LookupContent = flow(function * (contentId) {
    const client = this.rootStore.client;

    contentId = contentId.replace(/ /g, "");

    if(!contentId) { return; }

    try {
      let libraryId, objectId, versionHash, accessType;
      if(contentId.startsWith("ilib")) {
        libraryId = contentId;
        accessType = "library";
      } else if(contentId.startsWith("hq__")) {
        objectId = client.utils.DecodeVersionHash(contentId).objectId;
        versionHash = contentId;
      } else if(contentId.startsWith("iq__")) {
        objectId = contentId;
      } else if(contentId.startsWith("0x")) {
        const id = client.utils.AddressToObjectId(contentId);
        accessType = yield client.AccessType({id});

        if(accessType === "library") {
          libraryId = client.utils.AddressToLibraryId(contentId);
        } else {
          objectId = id;
        }
      } else {
        objectId = client.utils.AddressToObjectId(client.utils.HashToAddress(contentId));
      }

      if(objectId && !libraryId) {
        libraryId = yield client.ContentObjectLibraryId({objectId});
      }

      if(!accessType) {
        accessType = yield client.AccessType({id: objectId});
      }

      const name = yield client.ContentObjectMetadata({
        libraryId,
        objectId: objectId || libraryId.replace(/^ilib/, "iq__"),
        metadataSubtree: "public/name"
      });

      if(accessType === "library") {
        return { name, libraryId };
      } else if(accessType === "object") {
        if(!versionHash) {
          versionHash = yield client.LatestVersionHash({objectId});
        }

        return { name, libraryId, objectId, versionHash };
      }

      throw "Invalid content ID";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to look up ID:");
      // eslint-disable-next-line no-console
      console.error(error);

      return { error: "Invalid content ID" };
    }
  });
}

export default ContentStore;
