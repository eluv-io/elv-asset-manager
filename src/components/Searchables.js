import React from "react";
import {inject, observer} from "mobx-react";
import {InitPSF} from "./Misc";
import {Action, Modal} from "elv-components-js";
import {Clip} from "./Clips";
import ContentBrowser from "./ContentBrowser";

@inject("rootStore")
@inject("formStore")
@observer
class Searchables extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
      previews: {}
    };

    this.AddClip = this.AddClip.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
    this.CloseModal = this.CloseModal.bind(this);

    this.InitPSF = InitPSF.bind(this);
    this.InitPSF({
      sortKey: "displayTitle",
      perPage: 100,
      additionalState: {
        key: "searchables"
      }
    });
  }

  AddClip(props) {
    let {versionHashes=[], versionHash} = props;
    if(versionHash) { versionHashes = [versionHash]; }

    versionHashes.forEach(versionHash => {
      this.props.formStore.AddSearchable(({
        versionHash
      }));
    });

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
            header={"Select Searchables"}
            objectOnly={true}
            onComplete={this.AddClip}
            onCancel={this.CloseModal}
            multiple={true}
            SetDisabled={props => !props.ipTitleId}
            disabledText="Title must have an IP Title ID"
            hideDefaultDisabledText={true}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  ClipsList() {
    let clips = this.props.formStore.currentLocalizedData.searchables;

    if(this.state.activeFilter) {
      clips = clips.filter(clip => {
        const searchTerms = ["id", "versionHash"];

        return searchTerms.some(term => (clip[term] || "").toLowerCase().includes(this.state.activeFilter));
      });
    }

    return clips;
  }

  render() {
    const clips = this.ClipsList();

    return (
      <div className="asset-form-section-container">
        <h3>Searchables</h3>
        <div className="controls">
          <Action onClick={this.ActivateModal}>
            Add Searchables
          </Action>
          { this.Filter("Filter Searchables...") }
        </div>
        { this.PageControls(clips.length) }
        <div className="asset-form-clips-container">
          {
            clips.length ?
              <div className="asset-form-clip">
                <div></div>
                <div></div>
                { this.SortableHeader("id", "IP Title ID", "Searchables") }
                { this.SortableHeader("versionHash", "Version Hash", "Searchables") }
                <div></div>
                <div></div>
              </div> : null
          }
          {
            this.Paged(clips || []).map((clip, index) =>
              <Clip
                index={index}
                key={`asset-clip-searchables-${index}`}
                clip={clip}
                length={clips.length}
                Update={() => this.props.formStore.UpdateClip({
                  key: "searchables",
                  index: this.props.formStore.ClipOriginalIndex({versionHash: clip.versionHash, key: "searchables"}),
                  clips: this.Paged(clips)
                })}
                Remove={() => {
                  this.props.formStore.RemoveClip({
                    key: "searchables",
                    index: this.props.formStore.ClipOriginalIndex({versionHash: clip.versionHash, key: "searchables"}),
                    clips
                  });
                }}
                OpenObjectLink={this.props.rootStore.OpenObjectLink}
              />
            )
          }
        </div>
        { this.state.modal }
      </div>
    );
  }
}

export default Searchables;
