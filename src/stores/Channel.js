import {action, observable, flow, toJS, computed} from "mobx";
import {DateTime} from "luxon";

class ChannelStore {
  @observable streamLibraryId;
  @observable streamId;
  @observable streamInfo = {};
  @observable streamStatus;
  @observable streamActive = false;

  @observable schedule = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed get dailySchedule() {
    let dailySchedule = {};
    this.schedule.forEach(program => {
      const startDate = DateTime.fromMillis(program.start_time_epoch).toFormat("yyyyLLdd");
      const endDate = DateTime.fromMillis(program.end_time_epoch - 1).toFormat("yyyyLLdd");

      if(!dailySchedule[startDate]) {
        dailySchedule[startDate] = [];
      }

      if(!dailySchedule[endDate]) {
        dailySchedule[endDate] = [];
      }

      dailySchedule[startDate].push(program);

      if(startDate !== endDate) {
        dailySchedule[endDate].push(program);
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
          end_time_epoch: otherProgram.start_time_epoch,
          duration_sec: otherProgram.duration_sec
        }));
      }

      return program;
    });

    // Resolve file images
    schedule = yield Promise.all(
      schedule.map(async program => {
        if(program.program_image && files[program.program_image]) {
          program.imageUrl = await this.rootStore.client.Rep({
            libraryId,
            objectId,
            rep: `thumbnail/files/${program.program_image}`
          });
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
    this.streamActive = false;

    yield this.RetrieveStreamInfo({streamLibraryId: libraryId, streamId: objectId});
  });

  @action.bound
  SaveChannelInfo = flow(function * ({writeToken}) {
    const client = this.rootStore.client;
    const {libraryId, objectId} = this.rootStore.params;

    let schedule = {};
    Object.keys(this.dailySchedule).map(date => {
      schedule[date] = this.dailySchedule[date].map(program =>
        ({
          title: program.title || "",
          description: program.description || "",
          start_time_epoch: program.start_time_epoch,
          duration_sec: program.duration_sec,
          program_id: program.program_id,
          program_image: program.program_image,
          signature: program.signature
        })
      );
    });

    yield client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "public/asset_metadata/channel_info",
      metadata: {
        stream_id: this.streamId,
        schedule: {
          daily_schedules: schedule
        }
      }
    });
  });
}

export default ChannelStore;
