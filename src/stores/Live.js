import {action, observable, flow, toJS} from "mobx";

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

  @observable streamStatus = {};

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
  @observable video_stream_id = -1;
  @observable force_equal_frame_duration = false;

  // Audio Parameters
  @observable audio_bitrate = 128000;
  @observable audio_index = 11;
  @observable dcodec = "aac";
  @observable audio_duration_ts = 1152000;
  @observable sample_rate = 48000;
  @observable audio_seg_duration_ts = 1440000;
  @observable audio_stream_id = -1;

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
      this.video_stream_id = metadata.video_tx_params.stream_id || this.video_stream_id;
      this.force_equal_frame_duration = metadata.video_tx_params.force_equal_frame_duration || this.force_equal_frame_duration;
    }

    // Audio Parameters
    if(metadata.audio_tx_params) {
      this.audio_bitrate = metadata.audio_tx_params.audio_bitrate || this.audio_bitrate;
      this.audio_index = metadata.audio_tx_params.audio_index || this.audio_index;
      this.dcodec = metadata.audio_tx_params.dcodec || this.dcodec;
      this.audio_duration_ts = metadata.audio_tx_params.duration_ts || this.audio_duration_ts;
      this.sample_rate = metadata.audio_tx_params.sample_rate || this.sample_rate;
      this.audio_stream_id = metadata.audio_tx_params.stream_id || this.audio_stream_id;
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

    const edgeWriteToken = yield client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "edge_write_token"
    });

    const ingressNode = yield client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "ingress_node_api"
    });

    if(!edgeWriteToken || !ingressNode) {
      this.streamStatus[objectId] = {
        active: false,
        status: "Off"
      };

      return this.streamStatus[objectId];
    }

    let streamStatus = this.streamStatus[objectId] || {};

    try {
      yield client.SetNodes({fabricURIs: [ingressNode]});

      if(!streamStatus.liveHandle || !streamStatus.edgeWriteToken) {
        const liveMeta = yield client.CallBitcodeMethod({
          libraryId,
          versionHash: yield client.LatestVersionHash({objectId}),
          method: "live/meta",
          constant: false
        });

        streamStatus.edgeWriteToken = liveMeta.live_recording_parameters.edge_write_token;
        streamStatus.liveHandle = liveMeta.live_recording_handle;
        streamStatus.node = ingressNode;
      }

      streamStatus.lroStatus = yield client.CallBitcodeMethod({
        libraryId,
        objectId,
        writeToken: streamStatus.edgeWriteToken,
        method: `live/status/${streamStatus.liveHandle}`,
        constant: false
      });

      // eslint-disable-next-line no-console
      console.log("LRO Status:");
      // eslint-disable-next-line no-console
      console.log(toJS(streamStatus.lroStatus));

      if(streamStatus.lroStatus.state === "running") {
        streamStatus.active = true;

        if(!streamStatus.lroStatus.custom.start_time || new Date(streamStatus.lroStatus.custom.start_time) < new Date("2020-01-01T00:00:00.000Z")) {
          streamStatus.status = "Active (Waiting for Media)";
        } else if(new Date(streamStatus.lroStatus.custom.current_time) - new Date(streamStatus.lroStatus.custom.last_update_time) > 60 * 1000){
          streamStatus.status = "Active (Stalled)";
        } else {
          streamStatus.status = "Active";
        }
      } else {
        streamStatus.active = false;

        if(!streamStatus.lroStatus.custom.end_time || new Date(streamStatus.lroStatus.custom.end_time) < new Date("2020-01-01T00:00:00.000Z")) {
          streamStatus.status = "Off (Terminated)";
        } else {
          streamStatus.status = "Off (Stopped)";
        }
      }

      this.streamStatus[objectId] = streamStatus;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("LRO Status error:");
      // eslint-disable-next-line no-console
      console.error(error);

      this.streamStatus[objectId] = {
        active: false,
        status: "Off (Terminated)"
      };
    } finally {
      yield client.ResetRegion();
    }

    return this.streamStatus[objectId];
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
    if(streamInfo && streamInfo.active) {
      // eslint-disable-next-line no-console
      console.error("Stream already started");
      return;
    }

    try {
      this.loading = true;

      let ingressRegion = this.ingress_region;
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

      yield client.FinalizeContentObject({libraryId, objectId, writeToken: tokenEdit.write_token});

      yield client.CallBitcodeMethod({
        libraryId,
        objectId,
        writeToken: edgeEdit.write_token,
        method: "live/start",
        constant: false
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to start stream:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      yield this.StreamInfo({libraryId, objectId});

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
          writeToken: streamInfo.edgeWriteToken,
          method: `live/stop/${streamInfo.liveHandle}`,
          constant: false,
          format: "text"
        });

        this.liveHandle = "";
      } catch (error) {
        if(error.body.errors[0].cause.kind !== "item does not exist") {
          throw error;
        } else {
          // eslint-disable-next-line no-console
          console.error("Handle does not exist - removing stream info from metadata");
          this.liveHandle = "";
        }
      }

      const { write_token } = yield client.EditContentObject({libraryId, objectId});

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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to stop stream:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      yield client.ResetRegion();
      yield this.StreamInfo({libraryId, objectId});
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

      yield client.MergeMetadata({
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
          stream_id: parseInt(this.video_stream_id),
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
          seg_duration_ts: parseInt(this.audio_seg_duration_ts),
          stream_id: parseInt(this.audio_stream_id)
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
