import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Action, Confirm, ImageIcon, LoadingElement} from "elv-components-js";
import {DateTime, Duration} from "luxon";

import {DateSelection, FileBrowser, Input, LabelledField, Selection, TextArea} from "elv-components-js";

import DefaultStreamIcon from "../../static/icons/stream.svg";
import ActiveIcon from "../../static/icons/activity.svg";
import WarningIcon from "../../static/icons/alert-circle.svg";

import TimeZones from "./TimeZones";

const Hash = s=>{for(var i=0,h=9;i<s.length;)h=Math.imul(h^s.charCodeAt(i++),9**9);return h^h>>>9;};
const Color = s => {
  const hash = Hash(s);
  return {
    r: Math.floor(Math.abs(hash) % 255),
    g: Math.floor(Math.abs(hash * 1.1) % 255),
    b: Math.floor(Math.abs(hash * 2.3) % 255)
  };
};

const ShortDuration = (start_time_epoch, end_time_epoch) => {
  let start = DateTime.fromMillis(start_time_epoch);
  let end = DateTime.fromMillis(end_time_epoch);

  // Show date if start time and end time are on different days
  let format = DateTime.TIME_WITH_SHORT_OFFSET;
  if(start.toLocaleString(DateTime.DATE_SHORT) !== end.toLocaleString(DateTime.DATE_SHORT)) {
    format = DateTime.DATETIME_SHORT;
  }

  return (
    start.toLocaleString(format) + " - " +
    end.toLocaleString(format) + " (" +
    Duration.fromMillis(end_time_epoch - start_time_epoch).toFormat("h 'Hours', m 'Minutes', s 'Seconds'") + ")"
  );
};

const ScheduleEntry = ({
  program,
  EditScheduleEntry,
  RemoveScheduleEntry
}) => {
  const [expanded, setExpanded] = useState(false);

  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(program.title);
  const [newDescription, setNewDescription] = useState(program.description);
  const [newProgramId, setNewProgramId] = useState(program.program_id);
  const [newStartTime, setNewStartTime] = useState(program.start_time_epoch);
  const [newEndTime, setNewEndTime] = useState(program.end_time_epoch);

  const { r, g, b } = Color(program.program_id);
  let colorIcon = (
    <div
      className="schedule-entry-color-icon"
      style={{
        backgroundColor: `rgb(${r}, ${g}, ${b})`
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
      const conflictingPrograms = program.conflicts.map(otherProgram => (
        <div className="schedule-entry-conflict" key={`conflict-${program.scheduleIndex}-${otherProgram.scheduleIndex}`}>
          <LabelledField label="Title" value={otherProgram.title}/>
          <LabelledField label="Start Time" value={DateTime.fromMillis(otherProgram.start_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}/>
          <LabelledField label="End Time" value={DateTime.fromMillis(otherProgram.end_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}/>
          <LabelledField label="Duration" value={Duration.fromMillis(otherProgram.duration_sec * 1000).toFormat("h 'Hours', m 'Minutes', s 'Seconds'")}/>
          <LabelledField label="Program ID" value={otherProgram.program_id} />
        </div>
      ));

      conflicts = (
        <div className="schedule-entry-conflicts-container">
          <h4>Warning: The following programs have schedules that conflict with this program:</h4>
          <div className="schedule-entry-conflicts">
            { conflictingPrograms }
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
  } else if(!editing) {
    entryInfo = (
      <div className="schedule-entry-info">
        <LabelledField label="Title" value={program.title} />
        <LabelledField label="Start Time" value={DateTime.fromMillis(program.start_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)} />
        <LabelledField label="End Time" value={DateTime.fromMillis(program.end_time_epoch).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)} />
        <LabelledField label="Duration" value={Duration.fromMillis(program.duration_sec * 1000).toFormat("h 'Hours', m 'Minutes', s 'Seconds'")} />
        <LabelledField label="Program ID" value={program.program_id} />
        <LabelledField hidden={!expanded} label="Description" value={program.description} />

        <div className="schedule-entry-actions">
          <Action
            onClick={event => {
              event.stopPropagation();
              setEditing(true);
            }}
          >
            Edit
          </Action>
          <Action
            className="danger"
            onClick={async event => {
              event.stopPropagation();
              await Confirm({
                message: "Are you sure you want to remove this entry from the schedule?",
                onConfirm: () => RemoveScheduleEntry(program.scheduleIndex)
              });
            }}
          >
            Remove
          </Action>
        </div>

        { conflicts }
      </div>
    );
  } else {
    entryInfo = (
      <div className="schedule-entry-info">
        <Input label="Title" value={newTitle} onChange={title => setNewTitle(title)} />
        <DateSelection
          name="start_time_epoch"
          label="Start Time"
          value={newStartTime}
          onChange={setNewStartTime}
        />
        <DateSelection
          name="end_time_epoch"
          label="End Time"
          value={newEndTime}
          onChange={setNewEndTime}
        />
        <LabelledField
          label="Duration"
          value={Duration.fromMillis(newEndTime - newStartTime).toFormat("h 'Hours', m 'Minutes', s 'Seconds'")}
        />
        <Input label="Program ID" value={newProgramId} onChange={programId => setNewProgramId(programId)} />
        <TextArea label="Description" value={newDescription} onChange={description => setNewDescription(description)} />

        <div className="schedule-entry-actions">
          <Action
            className="secondary"
            onClick={() => {
              setEditing(false);
              setNewTitle(program.title);
              setNewProgramId(program.program_id);
              setNewDescription(program.description);
              setNewStartTime(program.start_time_epoch);
              setNewEndTime(program.end_time_epoch);
            }}
          >
            Cancel
          </Action>

          <Action
            className={newStartTime > newEndTime ? "tertiary" : ""}
            onClick={() => {
              if(newStartTime > newEndTime) { return; }

              EditScheduleEntry({
                index: program.scheduleIndex,
                title: newTitle,
                program_id: newProgramId,
                description: newDescription,
                start_time_epoch: newStartTime,
                end_time_epoch: newEndTime
              });
              setEditing(false);
            }}
          >
            Update
          </Action>
        </div>

        { conflicts }
      </div>
    );
  }

  return (
    <div
      className={`schedule-entry ${expanded ? "schedule-entry-expanded" : ""} ${program.scheduleIndex % 2 === 0 ? "even" : "odd"}`}
      key={`schedule-entry-${program.start_time_epoch}-${program.program_id}`}
    >
      { colorIcon }
      <div className="schedule-entry-icons">
        { activeIcon }
        { conflictIcon }
      </div>
      <ImageIcon
        label={program.title}
        icon={program.imageUrl || DefaultStreamIcon}
        alternateIcon={DefaultStreamIcon}
        className="schedule-entry-image"
        onClick={() => { setExpanded(!expanded); setEditing(false); }}
      />
      { entryInfo }
    </div>
  );
};

const ScheduleTimeline = ({date, programs}) => {
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
              key={`schedule-timeline-entry-${program.program_id}-${dayStartTime}-${program.start_time_epoch}`}
              className="schedule-timeline-entry"
              title={`${program.title} - ${ShortDuration(program.start_time_epoch, program.end_time_epoch)}`}
              style={{
                width: `${width}%`,
                left: `${position}%`,
                backgroundColor: `rgb(${r}, ${g}, ${b})`
              }}
            />
          );
        })
      }
    </div>
  );
};

const DailySchedule = ({schedule, date, EditScheduleEntry, RemoveScheduleEntry}) => {
  const dateString = DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);

  const [show, setShow] = useState(true);

  return (
    <div className="schedule-daily-container" key={`schedule-entries-container-${date}`}>
      <h4 className="clickable" onClick={() => setShow(!show)}>{ dateString } { show ? "▲" : "▼"}</h4>
      <ScheduleTimeline date={date} programs={schedule} />
      <div className="schedule-entries-container" key={`schedule-entries-${date}`}>
        {
          show ?
            schedule.map(program =>
              <ScheduleEntry
                key={`schedule-entry-${date}-${program.scheduleIndex}`}
                program={program}
                EditScheduleEntry={EditScheduleEntry}
                RemoveScheduleEntry={RemoveScheduleEntry}
              />
            ) : null
        }
      </div>
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

  render() {
    return (
      <div className="stream-schedules-container">
        <h4 className="stream-info-header">Schedule</h4>
        { this.Browse() }
        <h4 className={`upload-message ${this.state.uploadError ? "upload-error" : ""}`}>
          { this.state.uploadError || this.state.uploadMessage }
        </h4>
        <Selection
          label="Reference Timezone"
          options={[
            [`Local Time (${this.props.channelStore.localTimezone})`, ""],
            ...TimeZones
          ]}
          onChange={zone => this.props.channelStore.SetReferenceTimezone(zone)}
        />
        {
          Object.keys(this.props.channelStore.dailySchedule).map(date =>
            <DailySchedule
              key={`schedule-${date}`}
              date={date}
              schedule={this.props.channelStore.dailySchedule[date]}
              EditScheduleEntry={this.props.channelStore.EditScheduleEntry}
              RemoveScheduleEntry={this.props.channelStore.RemoveScheduleEntry}
            />
          )
        }
      </div>
    );
  }
}

export default Schedule;
