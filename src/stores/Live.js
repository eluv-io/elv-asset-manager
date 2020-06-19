import {action, observable, flow} from "mobx";

class LiveStore {
  @observable regions = [
    ["Automatic", ""],
    ["NA Northwest", "na-west-north"],
    ["NA Southwest", "na-west-south"],
    ["NA East", "na-east"],
    ["EU West", "eu-west"],
    ["AU East", "au-east"]
  ];

  @observable loading = false;
  @observable streamInfo;
  @observable active = false;

  @observable origin_url = "";
  @observable ingest_type = "hls";
  @observable udp_port = 22001;
  @observable ingress_region = "";
  @observable ingressNode = "";
  @observable max_duration_sec = 28800;
  @observable abr_profile_id = "base720";

  // Video Parameters
  @observable resolution_width = 1280;
  @observable resolution_height = 720;
  @observable source_timescale = 90000;
  @observable video_duration_ts = 54000000;
  @observable force_keyint = 40;
  @observable video_seg_duration_ts = 2160000;
  @observable video_bitrate = 8000000;
  @observable force_equal_frame_duration = false;

  // Audio Parameters
  @observable audio_bitrate = 128000;
  @observable audio_index = 11;
  @observable dcodec = "aac";
  @observable audio_duration_ts = 1152000;
  @observable sample_rate = 48000;
  @observable audio_seg_duration_ts = 1440000;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action.bound
  Initialize = flow(function * () {
    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    const metadata = yield client.ContentObjectMetadata({
      libraryId,
      objectId,
      resolveLinks: false
    });

    this.origin_url = metadata.origin_url || this.origin_url;
    this.ingest_type = metadata.ingest_type || this.ingest_type;
    this.udp_port = metadata.udp_port || this.udp_port;
    this.ingress_region = metadata.ingress_region || this.ingress_region;
    this.ingressNode = metadata.ingressNode || this.ingressNode;
    this.max_duration_sec = metadata.max_duration_sec || this.max_duration_sec;
    this.source_timescale = metadata.source_timescale || this.source_timescale;
    this.abr_profile_id = metadata.abr_profile_id || this.abr_profile_id;

    // Video Parameters
    if(metadata.video_tx_params) {
      this.resolution_width = metadata.video_tx_params.enc_width || this.resolution_width;
      this.resolution_height = metadata.video_tx_params.enc_height || this.resolution_height;
      this.video_duration_ts = metadata.video_tx_params.duration_ts || this.video_duration_ts;
      this.force_keyint = metadata.video_tx_params.force_keyint || this.force_keyint;
      this.video_seg_duration_ts = metadata.video_tx_params.seg_duration_ts || this.video_seg_duration_ts;
      this.video_bitrate = metadata.video_tx_params.video_bitrate || this.video_bitrate;
      this.force_equal_frame_duration = metadata.video_tx_params.force_equal_frame_duration || this.force_equal_frame_duration;
    }

    // Audio Parameters
    if(metadata.audio_tx_params) {
      this.audio_bitrate = metadata.audio_tx_params.audio_bitrate || this.audio_bitrate;
      this.audio_index = metadata.audio_tx_params.audio_index || this.audio_index;
      this.dcodec = metadata.audio_tx_params.dcodec || this.dcodec;
      this.audio_duration_ts = metadata.audio_tx_params.duration_ts || this.audio_duration_ts;
      this.sample_rate = metadata.audio_tx_params.sample_rate || this.sample_rate;
      this.audio_seg_duration_ts = metadata.audio_tx_params.seg_duration_ts || this.audio_seg_duration_ts;
    }

    // Load current stream info, if present
    yield this.StreamInfo();
  });

  @action.bound
  UpdateParameter(name, value) {
    this[name] = value;
  }

  @action.bound
  StreamInfo = flow(function * ({libraryId, objectId}={}) {
    const client = this.rootStore.client;
    if(!objectId) {
      libraryId = this.rootStore.params.libraryId;
      objectId = this.rootStore.params.objectId;
    } else if(!libraryId) {
      libraryId = yield client.ContentObjectLibraryId({objectId});
    }

    this.streamInfo = yield client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "public/live_stream_info"
    });

    this.active = !!this.streamInfo;

    return this.streamInfo;
  });

  @action.bound
  StartStream = flow(function * ({libraryId, objectId}={}) {
    const client = this.rootStore.client;
    if(!objectId) {
      libraryId = this.rootStore.params.libraryId;
      objectId = this.rootStore.params.objectId;
    } else if(!libraryId) {
      libraryId = yield client.ContentObjectLibraryId({objectId});
    }

    const streamInfo = yield this.StreamInfo({libraryId, objectId});
    if(streamInfo) {
      // eslint-disable-next-line no-console
      console.error("Stream already started");
      return;
    }

    try {
      this.loading = true;

      let ingressRegion = this.ingressRegion;
      if(objectId === this.rootStore.params.objectId) {
        // Update current settings if operating on stream
        const {write_token} = yield client.EditContentObject({libraryId, objectId});
        yield this.SaveLiveParameters({libraryId, objectId, writeToken: write_token});
        yield client.FinalizeContentObject({libraryId, objectId, writeToken: write_token});
      } else {
        // Operating on separate stream object - pull ingress region
        ingressRegion = yield client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "ingress_region"
        });
      }

      // Switch to ingress node
      let {fabricURIs} = yield client.UseRegion({region: ingressRegion});
      yield client.SetNodes({fabricURIs: [fabricURIs[0]]});

      // Create draft for live edge
      const edgeEdit = yield client.EditContentObject({libraryId, objectId});

      // Create draft for live management info
      const infoEdit = yield client.EditContentObject({libraryId, objectId});

      // Create draft for setting write token
      const tokenEdit = yield client.EditContentObject({libraryId, objectId});

      // Set edge write token and node in metadata for both drafts
      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken: tokenEdit.write_token,
        metadata: {
          edge_write_token: edgeEdit.write_token,
          ingress_node_api: fabricURIs[0]
        }
      });

      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken: infoEdit.write_token,
        metadata: {
          edge_write_token: edgeEdit.write_token,
          ingress_node_api: fabricURIs[0]
        }
      });

      yield client.FinalizeContentObject({libraryId, objectId, writeToken: tokenEdit.write_token});

      const { handle } = yield client.CallBitcodeMethod({
        libraryId,
        objectId,
        writeToken: edgeEdit.write_token,
        method: "live/start",
        constant: false
      });

      /* TODO: Check status before updating

      const liveMeta = yield client.CallBitcodeMethod({
        libraryId,
        objectId,
        method: "live/meta",
        constant: false
      });

      console.log(liveMeta);

       */


      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken: infoEdit.write_token,
        metadataSubtree: "public/live_stream_info",
        metadata: {
          node: fabricURIs[0],
          write_token: edgeEdit.write_token,
          handle
        }
      });

      yield client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: infoEdit.write_token
      });

      this.active = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to start stream:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      yield client.ResetRegion();
      this.loading = false;
    }
  });

  @action.bound
  StopStream = flow(function * ({libraryId, objectId}={}) {
    const client = this.rootStore.client;
    if(!objectId) {
      libraryId = this.rootStore.params.libraryId;
      objectId = this.rootStore.params.objectId;
    } else if(!libraryId) {
      libraryId = yield client.ContentObjectLibraryId({objectId});
    }

    try {
      this.loading = true;

      const streamInfo = yield this.StreamInfo({libraryId, objectId});

      if(!streamInfo) {
        // eslint-disable-next-line no-console
        console.error("Stream is not started or has no live info");
        return;
      }

      yield client.SetNodes({fabricURIs: [streamInfo.node]});

      try {
        yield client.CallBitcodeMethod({
          libraryId,
          objectId,
          writeToken: streamInfo.write_token,
          method: `live/stop/${streamInfo.handle}`,
          constant: false,
          format: "text"
        });
      } catch (error) {
        if(error.body.errors[0].cause.kind !== "item does not exist") {
          throw error;
        } else {
          // eslint-disable-next-line no-console
          console.error("Handle does not exist - removing stream info from metadata");
        }
      }

      yield new Promise(resolve => setTimeout(resolve, 2000));

      try {
        yield client.FinalizeContentObject({
          libraryId,
          objectId,
          writeToken: streamInfo.write_token
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to finalize live edge token", streamInfo.write_token);
        // eslint-disable-next-line no-console
        console.error(error);
      }

      yield new Promise(resolve => setTimeout(resolve, 2000));

      const { write_token } = yield client.EditContentObject({libraryId, objectId});

      yield client.DeleteMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree: "public/live_stream_info"
      });

      yield client.DeleteMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree: "edge_write_token"
      });

      yield client.DeleteMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree: "ingress_node_api"
      });

      yield client.FinalizeContentObject({libraryId, objectId, writeToken: write_token});

      this.active = false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to stop stream:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      yield client.ResetRegion();
      this.loading = false;
    }
  });

  @action.bound
  SaveLiveParameters = flow(function * ({libraryId, objectId, writeToken}) {
    const client = this.rootStore.client;
    if(!objectId) {
      libraryId = this.rootStore.params.libraryId;
      objectId = this.rootStore.params.objectId;
    } else if(!libraryId) {
      libraryId = yield client.ContentObjectLibraryId({objectId});
    }

    try {
      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadata: {
          origin_url: this.origin_url,
          ingest_type: this.ingest_type,
          ingress_region: this.ingress_region,
          resolution: `${this.resolution_width}x${this.resolution_height}`,
          max_duration_sec: this.max_duration_sec,
          source_timescale: this.source_timescale,
          abr_profile_id: this.abr_profile_id,
          public: {
            asset_metadata: {
              video_type: "live"
            }
          }
        }
      });

      if(this.ingest_type === "udp") {
        yield client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "udp_port",
          metadata: parseInt(this.udp_port)
        });
      }

      yield client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "video_tx_params",
        metadata: {
          duration_ts: parseInt(this.video_duration_ts),
          enc_width: parseInt(this.resolution_width),
          enc_height: parseInt(this.resolution_height),
          force_keyint: parseInt(this.force_keyint),
          seg_duration_ts: parseInt(this.video_seg_duration_ts),
          video_bitrate: parseInt(this.video_bitrate),
          force_equal_frame_duration: this.force_equal_frame_duration
        }
      });

      yield client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "audio_tx_params",
        metadata: {
          audio_bitrate: parseInt(this.audio_bitrate),
          audio_index: parseInt(this.audio_index),
          dcodec: this.dcodec,
          duration_ts: parseInt(this.audio_duration_ts),
          sample_rate: parseInt(this.sample_rate),
          seg_duration_ts: parseInt(this.audio_seg_duration_ts)
        }
      });

      yield client.CreateLinks({
        libraryId,
        objectId,
        writeToken,
        links: [{
          type: "rep",
          path: "public/asset_metadata/sources/default",
          target: "playout/default/options.json"
        }]
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save live stream parameters:");
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  });
}

export default LiveStore;
