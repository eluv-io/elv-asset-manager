import React from "react";
import {inject, observer} from "mobx-react";
import {Checkbox, Input, Selection, ToggleSection} from "elv-components-js";

import {Action, Confirm, ImageIcon, LoadingElement} from "elv-components-js";

import StreamActive from "../../static/icons/video.svg";
import StreamInactive from "../../static/icons/video-off.svg";
import VideoPreview from "../VideoPreview";
import AppFrame from "../AppFrame";

import UrlJoin from "url-join";

@inject("rootStore")
@inject("liveStore")
@observer
class LiveStream extends React.Component {
  componentDidMount() {
    this.props.liveStore.StreamInfo();
  }

  Status() {
    return this.props.liveStore.streamStatus[this.props.rootStore.params.objectId] || {};
  }

  ToggleStream() {
    const active = this.Status().active;

    return (
      <Action
        className="toggle-stream-button"
        onClick={async () => (
          await Confirm({
            message: `Are you sure you want to ${active ? "stop" : "start"} the stream?`,
            onConfirm: active ? this.props.liveStore.StopStream : this.props.liveStore.StartStream
          })
        )}
      >
        { `${active ? "Stop" : "Start"} Stream` }
      </Action>
    );
  }

  StreamPreview() {
    if(!this.Status().active) { return null; }

    const streamSampleUrl = EluvioConfiguration.apps && (EluvioConfiguration.apps["Stream Sample"] || EluvioConfiguration.apps["stream-sample"]);

    if(!streamSampleUrl) {
      return (
        <ToggleSection sectionName="Stream Preview">
          <VideoPreview objectId={this.props.rootStore.params.objectId}/>
        </ToggleSection>
      );
    }

    return (
      <ToggleSection sectionName="Stream Preview">
        <AppFrame
          appUrl={UrlJoin(streamSampleUrl, "/#/", this.props.rootStore.params.objectId)}
          queryParams={{action: "display"}}
          className="preview-frame"
        />
      </ToggleSection>
    );
  }

  VideoParameters() {
    return (
      <ToggleSection sectionName="Video Parameters">
        <Input
          type="number"
          name="resolution_width"
          value={this.props.liveStore.resolution_width}
          onChange={resolution_width => this.props.liveStore.UpdateParameter("resolution_width", resolution_width)}
        />

        <Input
          type="number"
          name="resolution_height"
          value={this.props.liveStore.resolution_height}
          onChange={resolution_height => this.props.liveStore.UpdateParameter("resolution_height", resolution_height)}
        />

        <Input
          name="source_timescale"
          value={this.props.liveStore.source_timescale}
          onChange={source_timescale => this.props.liveStore.UpdateParameter("source_timescale", source_timescale)}
        />

        <Input
          name="video_duration_ts"
          label="Duration Timescale"
          value={this.props.liveStore.video_duration_ts}
          onChange={video_duration_ts => this.props.liveStore.UpdateParameter("video_duration_ts", video_duration_ts)}
        />

        <Input
          name="force_keyint"
          label="Force KeyInt"
          value={this.props.liveStore.force_keyint}
          onChange={force_keyint => this.props.liveStore.UpdateParameter("force_keyint", force_keyint)}
        />

        <Input
          name="video_seg_duration_ts"
          label="Segment Duration Timescale"
          value={this.props.liveStore.video_seg_duration_ts}
          onChange={video_seg_duration_ts => this.props.liveStore.UpdateParameter("video_seg_duration_ts", video_seg_duration_ts)}
        />

        <Input
          name="video_bitrate"
          label="Bitrate"
          value={this.props.liveStore.video_bitrate}
          onChange={video_bitrate => this.props.liveStore.UpdateParameter("video_bitrate", video_bitrate)}
        />

        <Input
          name="video_stream_id"
          value={this.props.liveStore.video_stream_id}
          onChange={video_stream_id => this.props.liveStore.UpdateParameter("video_stream_id", video_stream_id)}
        />

        <Checkbox
          name="force_equal_frame_duration"
          label="Force Equal Frame Duration"
          value={this.props.liveStore.force_equal_frame_duration}
          onChange={force_equal_frame_duration => this.props.liveStore.UpdateParameter("force_equal_frame_duration", force_equal_frame_duration)}
        />
      </ToggleSection>
    );
  }

  AudioParameters() {
    return (
      <ToggleSection sectionName="Audio Parameters">
        <Input
          name="audio_bitrate"
          label="Bitrate"
          value={this.props.liveStore.audio_bitrate}
          onChange={audio_bitrate => this.props.liveStore.UpdateParameter("audio_bitrate", audio_bitrate)}
        />

        <Input
          name="audio_index"
          label="Track Index"
          value={this.props.liveStore.audio_index}
          onChange={audio_index => this.props.liveStore.UpdateParameter("audio_index", audio_index)}
        />

        <Input
          name="dcodec"
          label="Codec"
          value={this.props.liveStore.dcodec}
          onChange={dcodec => this.props.liveStore.UpdateParameter("dcodec", dcodec)}
        />

        <Input
          name="audio_duration_ts"
          label="Duration Timescale"
          value={this.props.liveStore.audio_duration_ts}
          onChange={audio_duration_ts => this.props.liveStore.UpdateParameter("audio_duration_ts", audio_duration_ts)}
        />

        <Input
          name="sample_rate"
          label="Sample Rate"
          value={this.props.liveStore.sample_rate}
          onChange={sample_rate => this.props.liveStore.UpdateParameter("sample_rate", sample_rate)}
        />

        <Input
          name="audio_seg_duration_ts"
          label="Segment Duration Timescale"
          value={this.props.liveStore.audio_seg_duration_ts}
          onChange={audio_seg_duration_ts => this.props.liveStore.UpdateParameter("audio_seg_duration_ts", audio_seg_duration_ts)}
        />

        <Input
          name="audio_stream_id"
          value={this.props.liveStore.audio_stream_id}
          onChange={audio_stream_id => this.props.liveStore.UpdateParameter("audio_stream_id", audio_stream_id)}
        />
      </ToggleSection>
    );
  }

  render() {
    const status = this.Status();

    return (
      <div className="asset-form-section-container asset-form-live-container">
        <h3 className="live-header">
          <div
            onClick={this.props.liveStore.StreamInfo}
            className={`stream-indicator ${status.active ? "stream-indicator-active" : "stream-indicator-inactive"}`}
          >
            <ImageIcon
              icon={status.active ? StreamActive : StreamInactive}
              title={status.active ? "Stream Active" : "Stream Inactive"}
            />
          </div>
          <div className="stream-status">{ status.status }</div>

          Live Stream Management

          <LoadingElement loading={this.props.liveStore.loading} loadingClassname="toggle-stream-loading">
            { this.ToggleStream() }
          </LoadingElement>
        </h3>

        <div className="asset-info-container">
          { this.StreamPreview() }

          <Input
            name="origin_url"
            label="Stream Origin URL"
            value={this.props.liveStore.origin_url}
            onChange={origin_url => this.props.liveStore.UpdateParameter("origin_url", origin_url)}
          />

          <Selection
            name="ingest_type"
            value={this.props.liveStore.ingest_type}
            onChange={ingest_type => this.props.liveStore.UpdateParameter("ingest_type", ingest_type)}
            options={[["HLS", "hls"], ["UDP", "udp"]]}
          />

          <Input
            type="integer"
            name="udp_port"
            label="UDP Port"
            hidden={this.props.liveStore.ingest_type !== "udp"}
            onChange={udp_port => this.props.liveStore.UpdateParameter("udp_port", udp_port)}
          />

          <Selection
            name="ingress_region"
            value={this.props.liveStore.ingress_region}
            onChange={ingress_region => this.props.liveStore.UpdateParameter("ingress_region", ingress_region)}
            options={this.props.liveStore.regions}
          />

          <Input
            type="number"
            name="max_duration_sec"
            label="Max Duration (seconds)"
            value={this.props.liveStore.max_duration_sec}
            onChange={max_duration_sec => this.props.liveStore.UpdateParameter("max_duration_sec", max_duration_sec)}
          />

          <Selection
            name="abr_profile_id"
            label="ABR Profile"
            value={this.props.liveStore.abr_profile_id}
            options={["base720", "sports720@60"]}
            onChange={abr_profile_id => this.props.liveStore.UpdateParameter("abr_profile_id", abr_profile_id)}
          />

          { this.VideoParameters() }
          { this.AudioParameters() }
        </div>
      </div>
    );
  }
}

export default LiveStream;
