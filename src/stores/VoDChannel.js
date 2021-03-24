import {action, observable, flow} from "mobx";
import UrlJoin from "url-join";

class VoDChannel {
  @observable offerings = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  UpdateOfferings(_, offerings) {
    this.offerings = offerings;
  }

  @action.bound
  LoadChannelInfo = flow(function * () {
    const offerings = (yield this.rootStore.client.ContentObjectMetadata({
      ...this.rootStore.params,
      metadataSubtree: "channel/offerings"
    })) || {};

    this.offerings = Object.keys(offerings).map(offeringKey => {
      const offering = offerings[offeringKey];
      return {
        ...offering,
        display_name: offering.display_name || offeringKey,
        display_image: offering.display_image ? this.rootStore.formStore.LinkComponents(offering.display_image) : undefined,
        offering_key: offeringKey,
        items: offering.items.map(item => {
          const { targetHash, path } = this.rootStore.formStore.LinkComponents({"/": item.source_ref});
          return {
            ...item,
            source_ref: {
              versionHash: targetHash,
              objectId: this.rootStore.client.utils.DecodeVersionHash(targetHash).objectId,
              name: item.display_name,
              offering: path.split("/").slice(-1)[0]
            }
          };
        })
      };
    });
  });

  @action.bound
  SaveChannelInfo = flow(function * ({writeToken}) {
    let offerings = {};

    yield Promise.all(
      this.offerings.map(async offering => {
        let playout;
        const items = (await Promise.all(
          offering.items.map(async item => {
            if(!item.source_ref) { return; }

            const duration_rat = await this.rootStore.client.ContentObjectMetadata({
              versionHash: item.source_ref.versionHash,
              metadataSubtree: `offerings/${item.source_ref.offering}/media_struct/streams/video/duration/rat`
            });

            if(!playout) {
              playout = await this.rootStore.client.ContentObjectMetadata({
                versionHash: item.source_ref.versionHash,
                metadataSubtree: `offerings/${item.source_ref.offering}/playout`,
                remove: [
                  "drm_keys"
                ]
              });
            }

            return {
              display_name: item.display_name,
              duration_rat,
              source_ref: `/q/${item.source_ref.versionHash}/rep/playout/${item.source_ref.offering}`,
              type: item.type || "mez_vod"
            };
          })
        )).filter(item => item);

        let display_image;
        if(offering.display_image) {
          display_image = this.rootStore.formStore.CreateLink({targetHash: offering.display_image.targetHash, linkTarget: UrlJoin("files", offering.display_image.path)});
        }

        offerings[offering.offering_key] = {
          ...offerings[offering.offering_key],
          playout_type: offering.type || "ch_vod",
          display_name: offering.display_name,
          description: offering.description,
          display_image,
          items,
          playout
        };
      })
    );

    yield this.rootStore.client.ReplaceMetadata({
      ...this.rootStore.params,
      writeToken,
      metadataSubtree: "channel/offerings",
      metadata: offerings
    });

    yield this.rootStore.client.ReplaceMetadata({
      ...this.rootStore.params,
      writeToken,
      metadataSubtree: "public/channel",
      metadata: true
    });
  });
}

export default VoDChannel;
