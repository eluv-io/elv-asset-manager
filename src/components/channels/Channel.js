import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, IconButton, ImageIcon, LoadingElement, Modal} from "elv-components-js";
import {DateTime, Duration} from "luxon";

import {FileBrowser, LabelledField} from "../Inputs";
import VideoPreview from "../VideoPreview";
import ContentBrowser from "../ContentBrowser";

import StreamActive from "../../static/icons/video.svg";
import StreamInactive from "../../static/icons/video-off.svg";
import LinkIcon from "../../static/icons/external-link.svg";
import ActiveIcon from "../../static/icons/activity.svg";
import WarningIcon from "../../static/icons/alert-circle.svg";

const Hash = s=>{for(var i=0,h=9;i<s.length;)h=Math.imul(h^s.charCodeAt(i++),9**9);return h^h>>>9;};
const Color = s => {
  const hash = Hash(s);
  return {
    r: Math.floor(Math.abs(hash) % 255),
    g: Math.floor(Math.abs(hash * 1.1) % 255),
    b: Math.floor(Math.abs(hash * 2.3) % 255)
  };
};

const ShortDuration = (start_time_epoch, end_time_epoch) =>
  DateTime.fromMillis(start_time_epoch).toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET) + " - " +
  DateTime.fromMillis(end_time_epoch).toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET) + " (" +
  Duration.fromMillis(end_time_epoch - start_time_epoch).toFormat("h 'Hours', m 'Minutes', s 'Seconds'") + ")";


const ScheduleEntry = ({program, index}) => {
  const [expanded, setExpanded] = useState(false);

  const { r, g, b } = Color(program.program_id);
  let colorIcon = (
    <div
      className="schedule-entry-color-icon"
      style={{
        "background-color": `rgb(${r}, ${g}, ${b})`
      }}
    />
  );

  let conflicts, conflictIcon;
  if(program.conflicts && program.conflicts.length > 0) {
    conflictIcon = (
      <ImageIcon
        icon={WarningIcon}
        label="Warning: This program has scheduling conflicts. Click to see more information."
        title="Warning: This program has scheduling conflicts. Click to see more information."
        className="conflict-warning-icon"
      />
    );

    if(expanded) {
      const conflictingPrograms = program.conflicts.map((otherProgram, conflictIndex) => (
        <div className="schedule-entry-conflict" key={`conflict-${index}-${conflictIndex}`}>
          <LabelledField label="Title" value={program.title}/>
          <LabelledField label="Start Time" value={DateTime.fromMillis(program.start_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}/>
          <LabelledField label="End Time" value={DateTime.fromMillis(program.end_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}/>
          <LabelledField label="Duration" value={Duration.fromMillis(program.duration_sec * 1000).toFormat("h 'Hours', m 'Minutes', s 'Seconds'")}/>
        </div>
      ));

      conflicts = (
        <div className="schedule-entry-conflicts-container">
          <h4>Warning: The following programs have schedules that conflict with this program:</h4>
          <div className="schedule-entry-conflicts">
            {conflictingPrograms}
          </div>
        </div>
      );
    }
  }

  let activeIcon;
  const now = DateTime.utc().ts;
  if(program.start_time_epoch <= now && program.end_time_epoch >= now) {
    activeIcon = (
      <ImageIcon
        icon={ActiveIcon}
        label="This program is currently active"
        title="This program is currently active"
        className="program-active-icon"
      />
    );
  }

  let entryInfo;
  if(!expanded) {
    entryInfo = (
      <div className="schedule-entry-info">
        <div>{ program.title }</div>
        <div>
          { ShortDuration(program.start_time_epoch, program.end_time_epoch) }
        </div>
      </div>
    );
  } else {
    entryInfo = (
      <div className="schedule-entry-info">
        <LabelledField label="Title" value={program.title} />
        <LabelledField label="Start Time" value={DateTime.fromMillis(program.start_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)} />
        <LabelledField label="End Time" value={DateTime.fromMillis(program.end_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)} />
        <LabelledField label="Duration" value={Duration.fromMillis(program.duration_sec * 1000).toFormat("h 'Hours', m 'Minutes', s 'Seconds'")} />
        <LabelledField hidden={!expanded} label="Description" value={program.description} />

        { conflicts }
      </div>
    );
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`schedule-entry ${expanded ? "schedule-entry-expanded" : ""} ${index % 2 === 0 ? "schedule-entry-even" : "schedule-entry-odd"}`}
      key={`schedule-entry-${program.start_time_epoch}-${program.program_id}`}
    >
      { colorIcon }
      <div className="schedule-entry-icons">
        { activeIcon }
        { conflictIcon }
      </div>
      <ImageIcon label={program.title} icon={program.imageUrl || StreamActive} alternateIcon={StreamActive} className="schedule-entry-image" />
      { entryInfo }
    </div>
  );
};

@inject("channelStore")
@observer
class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingSchedule: false,
      uploadMessage: "",
      uploadError: ""
    };
  }

  Browse() {
    return (
      <LoadingElement loading={this.state.loadingSchedule} loadingClassname="schedule-loading">
        <FileBrowser
          name="schedule"
          header="Schedule JSON"
          accept="application/json"
          multiple={false}
          directories={false}
          onChange={async event => {
            try {
              this.setState({loadingSchedule: true});

              const schedule = await new Response(event.target.files[0]).json();
              await this.props.channelStore.LoadSchedule(schedule);

              this.setState({
                loadingSchedule: false,
                uploadMessage: "Schedule successfully added",
                uploadError: ""
              });

              setTimeout(() => this.setState({uploadMessage: ""}), 5000);
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error);

              this.setState({
                loadingSchedule: false,
                uploadMessage: "",
                uploadError: `Failed to upload schedule file: ${error.message}`
              });
            }
          }}
        />
      </LoadingElement>
    );
  }

  ScheduleTimeline(date, programs) {
    const dayStartTime = DateTime.fromISO(date).ts;
    const dayEndTime = DateTime.fromISO(date).plus({days: 1}).ts;

    return (
      <div className="schedule-timeline">
        {
          programs.map(program => {
            const {r, g, b} = Color(program.program_id);
            const width = 100 * (Math.min(program.end_time_epoch, dayEndTime) - Math.max(program.start_time_epoch, dayStartTime)) / (60 * 60 * 24 * 1000);
            const position = 100 * (Math.max(0, program.start_time_epoch - dayStartTime)) / (60 * 60 * 24 * 1000);
            return (
              <div
                key={`schedule-timeline-entry-${program.program_id}-${program.start_time_epoch}`}
                className="schedule-timeline-entry"
                title={`${program.title} - ${ShortDuration(program.start_time_epoch, program.end_time_epoch)}`}
                style={{
                  width: `${width}%`,
                  left: `${position}%`,
                  "background-color": `rgb(${r}, ${g}, ${b})`
                }}
              />
            );
          })
        }
      </div>
    );
  }

  DailySchedule() {
    return Object.keys(this.props.channelStore.dailySchedule).map(date => {
      const dateString = DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);

      return (
        <div className="schedule-daily-container">
          <h4>{ dateString }</h4>
          { this.ScheduleTimeline(date, this.props.channelStore.dailySchedule[date]) }
          <div className="schedule-entries-container" key={`schedule-entries-${date}`}>
            { this.props.channelStore.dailySchedule[date].map((program, i) => <ScheduleEntry program={program} index={i} />) }
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="stream-schedules-container">
        <h4 className="stream-info-header">Schedule</h4>
        { this.Browse() }
        <h4 className={`upload-message ${this.state.uploadError ? "upload-error" : ""}`}>
          { this.state.uploadError || this.state.uploadMessage }
        </h4>
        { this.DailySchedule() }
      </div>
    );
  }
}

@inject("rootStore")
@inject("channelStore")
@observer
class StreamInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
      previewStream: false
    };

    this.SelectStream = this.SelectStream.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
  }

  StreamPreview() {
    if(!this.props.channelStore.streamActive || !this.state.previewStream) { return null; }

    return <VideoPreview objectId={this.props.channelStore.streamId} />;
  }

  ToggleStream() {
    const active = this.props.channelStore.streamActive;

    return (
      <Action
        className="toggle-stream-button"
        onClick={async () => (
          await Confirm({
            message: `Are you sure you want to ${active ? "stop" : "start"} the stream?`,
            onConfirm: active ? this.props.channelStore.StopStream : this.props.channelStore.StartStream
          })
        )}
      >
        { `${active ? "Stop" : "Start"} Stream` }
      </Action>
    );
  }

  SelectStream({libraryId, objectId}) {
    this.props.channelStore.SelectStream({libraryId, objectId});
    this.CloseModal();
  }

  ActivateModal() {
    this.setState({
      modal: (
        <Modal
          className="asset-form-modal"
          closable={true}
          OnClickOutside={this.CloseModal}
        >
          <ContentBrowser
            header="Live Stream Selection"
            objectOnly={true}
            onComplete={this.SelectStream}
            onCancel={this.CloseModal}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  Info() {
    const selectStreamButton = (
      <Action onClick={this.ActivateModal} className={this.props.channelStore.streamId ? "secondary" : ""}>
        { this.props.channelStore.streamId ? "Change Stream" : "Select Stream" }
      </Action>
    );

    if(!this.props.channelStore.streamId) {
      return selectStreamButton;
    }

    let previewStreamButton;
    if(this.props.channelStore.streamActive) {
      previewStreamButton = (
        <Action className="secondary" onClick={() => this.setState({previewStream: !this.state.previewStream})}>
          {this.state.previewStream ? "Hide" : "Show"} Preview
        </Action>
      );
    }

    const info = this.props.channelStore.streamInfo || {};
    const name = info.display_title || info.title || info.name;

    return (
      <React.Fragment>
        <h4 className="stream-info-header">Stream Info</h4>
        <div className="channel-stream-info">
          <div className={`stream-indicator ${this.props.channelStore.streamActive ? "stream-indicator-active" : "stream-indicator-inactive"}`}>
            <ImageIcon
              icon={this.props.channelStore.streamActive ? StreamActive : StreamInactive}
              title={this.props.channelStore.streamActive ? "Stream Active" : "Stream Inactive"}
            />
          </div>

          <div className="stream-info-name">
            { name }
            <IconButton
              className="open-object-link"
              icon={LinkIcon}
              label="Open stream object in new tab"
              onClick={() => this.props.rootStore.OpenObjectLink({
                libraryId: this.props.channelStore.streamLibraryId,
                objectId: this.props.channelStore.streamId}
              )}
            />
          </div>
          <div className="light">{ this.props.channelStore.streamId }</div>
          <div className="light">{ info.originUrl }</div>
          <div className="stream-actions">
            { this.ToggleStream() }
            { previewStreamButton }
            { selectStreamButton }
          </div>
        </div>
        { this.StreamPreview() }
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="channel-stream-info-container">
        <div className="asset-info-container">
          { this.Info() }
        </div>

        { this.state.modal }
      </div>
    );
  }
}

@inject("channelStore")
@observer
class Channel extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container asset-form-live-container">
        <h3 className="live-header">
          Channel Management
        </h3>

        <StreamInfo />
        <Schedule />
      </div>
    );
  }
}

export default Channel;
