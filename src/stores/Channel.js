import {action, observable, flow, toJS, computed} from "mobx";
import {Settings, DateTime} from "luxon";

class ChannelStore {
  @observable streamLibraryId;
  @observable streamId;
  @observable streamInfo = {};
  @observable streamActive = false;
  @observable localTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  @observable referenceTimezone;

  @observable schedule = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed get streamStatus() {
    return this.rootStore.liveStore.streamStatus[this.streamId] || { active: false, status: "Off" };
  }

  @computed get dailySchedule() {
    let dailySchedule = {};
    this.schedule.forEach((program, scheduleIndex) => {
      program = {
        ...program,
        timeZone: this.referenceTimezone,
        scheduleIndex
      };

      // Add an entry for each day the program spans
      let date = DateTime.fromMillis(program.start_time_epoch);
      let end = DateTime.fromMillis(program.end_time_epoch - 1);
      while(date.toFormat("yyyyLLdd") <= end.toFormat("yyyyLLdd")) {
        const dateString = date.toFormat("yyyyLLdd");
        if(!dailySchedule[dateString]) {
          dailySchedule[dateString] = [];
        }

        dailySchedule[dateString].push(program);

        date = date.plus({days: 1});
      }
    });

    return dailySchedule;
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

    yield this.LoadSchedule(metadata.schedule);
  });

  @action.bound
  StreamInfo = flow(function * () {
    if(!this.streamId) { return; }

    yield this.rootStore.liveStore.StreamInfo({
      libraryId: this.streamLibraryId,
      objectId: this.streamId
    });
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

    yield this.UpdateStreamLink();
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

    yield this.UpdateStreamLink();
  });

  @action.bound
  UpdateStreamLink = flow(function * ({writeToken}={}) {
    if(!this.streamId) { return; }

    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    let finalize = false;
    if(!writeToken) {
      finalize = true;
      writeToken = (yield client.EditContentObject({
        libraryId,
        objectId
      })).write_token;
    }

    const streamHash = yield client.LatestVersionHash({objectId: this.streamId});
    yield client.MergeMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata",
      metadata: {
        sources: {
          default: this.rootStore.formStore.CreateLink({
            targetHash: streamHash,
            linkTarget: "/rep/playout/default/options.json"
          })
        }
      }
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/channel_info/stream",
      metadata: this.rootStore.formStore.CreateLink({
        targetHash: streamHash,
        linkTarget: "/rep/playout/default/options.json"
      })
    });

    if(finalize) {
      yield client.FinalizeContentObject({libraryId, objectId, writeToken, commitMessage: "Update channel stream link"});
    }
  });

  @action.bound
  RetrieveStreamInfo = flow(function * ({streamLibraryId, streamId}) {
    const streamInfo = (yield this.rootStore.client.ContentObjectMetadata({
      libraryId: streamLibraryId,
      objectId: streamId,
      metadataSubtree: "public",
      select: ["name", "asset_metadata"]
    })) || {};

    this.streamInfo = { ...(streamInfo.asset_metadata || {}), name: streamInfo.name };

    this.streamInfo.originUrl = yield this.rootStore.client.ContentObjectMetadata({
      libraryId: streamLibraryId,
      objectId: streamId,
      metadataSubtree: "origin_url"
    });

    if(this.streamInfo.originUrl === "undefined") {
      this.streamInfo.originUrl = "";
    }

    this.streamLibraryId = streamLibraryId;
    this.streamId = streamId;

    yield this.StreamInfo();
  });

  @action.bound
  SetReferenceTimezone(zone) {
    this.referenceTimezone = zone;
    Settings.defaultZoneName = zone;
  }

  @action.bound
  LoadSchedule = flow(function * (schedule) {
    if(!schedule) { return; }

    const newPrograms = (Object.values(schedule.daily_schedules) || {}).flat();

    this.schedule = yield this.FormatSchedule(toJS(this.schedule).concat(newPrograms));
  });

  FormatSchedule = flow(function * (schedule) {
    const {libraryId, objectId} = this.rootStore.params;
    const files = (yield this.rootStore.client.ContentObjectMetadata({
      libraryId,
      objectId,
      resolveLinks: false,
      metadataSubtree: "files"
    })) || {};

    schedule = schedule.sort((a, b) => a.start_time_epoch < b.start_time_epoch ? -1 : 1)
      .map(program => ({
        ...program,
        end_time_epoch: program.start_time_epoch + program.duration_sec * 1000
      }));

    // Remove duplicates
    schedule = schedule.filter((program, i) => {
      const matches = schedule.filter((otherProgram, j) =>
        program !== otherProgram &&
        i > j &&
        program.start_time_epoch === otherProgram.start_time_epoch &&
        program.end_time_epoch === otherProgram.end_time_epoch &&
        program.program_id === otherProgram.program_id
      );

      return matches.length === 0;
    });

    // Detect overlap
    schedule = schedule.map(program => {
      const conflicts = schedule.filter(otherProgram => {
        if(otherProgram === program) { return false; }

        return !(
          // Ends before program begins
          otherProgram.end_time_epoch <= program.start_time_epoch ||
          // Begins after program ends
          otherProgram.start_time_epoch >= program.end_time_epoch
        );
      });

      if(conflicts.length > 0) {
        program.conflicts = conflicts.map(otherProgram => ({
          title: otherProgram.title,
          start_time_epoch: otherProgram.start_time_epoch,
          end_time_epoch: otherProgram.end_time_epoch,
          duration_sec: otherProgram.duration_sec
        }));
      } else {
        program.conflicts = undefined;
      }

      return program;
    });

    // Resolve file images
    schedule = yield Promise.all(
      schedule.map(async program => {
        if(program.program_image) {
          const image = program.program_image.file || program.program_image;

          if(files[image]) {
            program.imageUrl = await this.rootStore.client.Rep({
              libraryId,
              objectId,
              rep: `thumbnail/files/${image}`
            });
          }
        }

        return program;
      })
    );

    return schedule;
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

    yield this.RetrieveStreamInfo({streamLibraryId: libraryId, streamId: objectId});
  });

  @action.bound
  // eslint-disable-next-line no-unused-vars
  EditScheduleEntry = flow(function * ({index, title, program_id, description, start_time_epoch, end_time_epoch}) {
    this.schedule[index] = {
      ...this.schedule[index],
      title,
      program_id,
      description,
      start_time_epoch,
      end_time_epoch,
      duration_sec: (end_time_epoch - start_time_epoch) / 1000
    };

    this.schedule = yield this.FormatSchedule(toJS(this.schedule));
  });

  @action.bound
  RemoveScheduleEntry(index) {
    this.schedule = this.schedule.filter((_, i) => i !== index);
  }

  @action.bound
  SaveChannelInfo = flow(function * ({writeToken}) {
    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    /*
    let schedule = {};
    Object.keys(this.dailySchedule).map(date => {
      schedule[date] = this.dailySchedule[date].map(program => {
        let image = program.program_image;
        if(image && typeof image === "string") {
          // Image is file specifier (loaded from schedule import). Make link
          image = {
            file: program.program_image,
            default: this.rootStore.formStore.CreateLink({linkTarget: UrlJoin("files", program.program_image)}),
            thumbnail: this.rootStore.formStore.CreateLink({linkTarget: UrlJoin("rep", "thumbnail", "files", program.program_image)})
          };
        }

        return {
          title: program.title || "",
          description: program.description || "",
          start_time_epoch: program.start_time_epoch,
          duration_sec: program.duration_sec,
          program_id: program.program_id,
          program_image: toJS(image),
          signature: program.signature
        };
      });
    });

     */

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/channel_info",
      metadata: {
        stream_id: this.streamId
      }
    });

    yield this.UpdateStreamLink({writeToken});
  });
}

export default ChannelStore;
