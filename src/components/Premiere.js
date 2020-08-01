import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Modal, Checkbox, DateSelection, Input} from "elv-components-js";
import ContentBrowser from "./ContentBrowser";
import {Clip} from "./Clips";

@inject("rootStore")
@inject("formStore")
@observer
class Premiere extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false
    };

    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
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
            header="Premiere Selection"
            onComplete={async ({versionHash}) => {
              await this.props.formStore.SetPremiereTitle(versionHash);
              this.CloseModal();
            }}
            onCancel={this.CloseModal}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  PremiereTitle() {
    const title = this.props.formStore.siteCustomization.premiere && this.props.formStore.siteCustomization.premiere.title;

    if(!title) { return null; }

    return (
      <div className="asset-form-clips-container">
        <Clip
          index={0}
          isPlayable={title.playable}
          clip={title}
          Remove={() => this.props.formStore.UpdatePremiere({...(this.props.formStore.siteCustomization.premiere), title: null})}
          OpenObjectLink={this.props.rootStore.OpenObjectLink}
        />
      </div>
    );
  }

  render() {
    if(!this.props.formStore.HasControl("premiere")) { return null; }

    const premiereInfo = this.props.formStore.siteCustomization.premiere || {};
    const premiereEnabled =  premiereInfo && premiereInfo.enabled;

    let premiereSettings;
    if(premiereEnabled) {
      premiereSettings = (
        <React.Fragment>
          <DateSelection
            label="Premiere Date"
            value={premiereInfo.premieresAt}
            onChange={premieresAt => this.props.formStore.UpdatePremiere({...premiereInfo, premieresAt})}
          />
          <Input
            value={premiereInfo.price}
            label="Price"
            onChange={price => this.props.formStore.UpdatePremiere({...premiereInfo, price})}
          />
          { this.PremiereTitle() }
          <Action onClick={this.ActivateModal}>
            Choose Title
          </Action>
          { this.state.modal }
        </React.Fragment>
      );
    }

    return (
      <div className="asset-form-section-container site-premiere-selection">
        <Checkbox
          label="Premiere"
          value={premiereEnabled}
          onChange={() => this.props.formStore.UpdatePremiere({...premiereInfo, enabled: !premiereInfo.enabled})}
        />
        { premiereSettings }
      </div>
    );
  }
}

export default Premiere;
