import {inject, observer} from "mobx-react";
import React from "react";
import {Action, Confirm, Checkbox, Input, TextArea, LabelledField, Maybe, Selection} from "elv-components-js";
import AsyncComponent from "./AsyncComponent";

@inject("rootStore")
@inject("formStore")
@observer
class SiteAccessCode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessCode: "",
      accountName: "",
      siteKey: "",
      siteId: "",
      newSiteKey: "",
      newSiteId: "",
      accountInfo: "{}",
      addToGroup: false,
      existingGroupAddress: "",
      createNewGroup: false,
      newGroupName: "",
      result: undefined,
      removeAccessCode: ""
    };

    this.Form = this.Form.bind(this);
    this.Submit = this.Submit.bind(this);
    this.Remove = this.Remove.bind(this);
  }

  async Submit(event) {
    event.preventDefault();

    await Confirm({
      message: "Are you sure you want to create this access code?",
      onConfirm: async () => {
        this.setState({result: undefined, error: undefined});

        try {
          this.setState({
            result: await this.props.formStore.CreateSiteAccessCode({
              accessCode: this.state.accessCode,
              accountName: this.state.accountName,
              accountInfo: this.state.accountInfo,
              siteKey: this.state.siteKey || this.state.newSiteKey,
              siteId: this.state.siteId || this.state.newSiteId,
              existingGroupAddress: this.state.addToGroup ? this.state.existingGroupAddress : undefined,
              newGroupName: this.state.createNewGroup ? this.state.newGroupName : undefined
            })
          });
        } catch (error) {
          this.setState({error: error.message || error});
        }
      }
    });
  }

  async Remove(event) {
    event.preventDefault();

    await Confirm({
      message: `Are you sure you want to remove the access code "${this.state.removeAccessCode}"`,
      onConfirm: async () => {
        this.setState({result: undefined, error: undefined});

        try {
          await this.props.formStore.RemoveSiteAccessCode({accessCode: this.state.removeAccessCode});

          this.setState({
            result: `Successfully deleted access code ${this.state.removeAccessCode}`
          });
        } catch (error) {
          this.setState({error: error.message || error});
        }
      }
    });
  }

  Error() {
    if(!this.state.error) { return null; }

    return (
      <div className="error-message access-code-error">
        { this.state.error }
      </div>
    );
  }

  Result() {
    if(!this.state.result) { return null; }

    if(typeof this.state.result === "string") {
      return (
        <div className="asset-form-section-container">
          <div className="access-code-results">
            <h3>{ this.state.result }</h3>
          </div>
        </div>
      );
    }

    return (
      <div className="asset-form-section-container">
        <div className="access-code-results">
          <h3>Successfully Created Access Code</h3>
          <h4>Please save the access code. It is not recoverable</h4>
          <LabelledField
            label="Access Code"
            value={this.state.result.accessCode}
          />
          <LabelledField
            label="Address"
            value={this.state.result.address}
          />
          <LabelledField
            label="Private Key"
            value={this.state.result.privateKey}
          />
          {Maybe(
            this.state.result.existingGroup.existingGroupName || this.state.result.newGroup.newGroupName,
            <LabelledField
              label="Added to"
              value={[this.state.result.existingGroup.existingGroupName, this.state.result.newGroup.newGroupName].filter(g => g).join(", ")}
            />
          )}
        </div>
      </div>
    );
  }

  RemoveAccessKeyForm() {
    return (
      <form onSubmit={this.Remove}>
        <div className="asset-form-section-container">
          <h3>Remove an access code</h3>
          <div className="asset-info-container section">
            <Input
              required
              name="removeAccessCode"
              label="Access Code"
              value={this.state.removeAccessCode}
              onChange={removeAccessCode => this.setState({removeAccessCode})}
            />
          </div>

          <Action type="submit" className="wide">
            Remove Access Code
          </Action>
        </div>
      </form>
    );
  }

  CreateAccessKeyForm() {
    return (
      <form onSubmit={this.Submit}>
        <div className="asset-form-section-container">
          <h3>Create a new access code</h3>
          <div className="asset-info-container section">
            <Input
              required
              name="accessCode"
              label="Access Code"
              value={this.state.accessCode}
              onChange={accessCode => this.setState({accessCode})}
            />
            <Input
              required
              name="accountName"
              label="Account Name"
              value={this.state.accountName}
              onChange={accountName => this.setState({accountName})}
            />
            <TextArea
              value={this.state.accountInfo}
              label="Account Info"
              onChange={accountInfo => this.setState({accountInfo})}
              name="accountInfo"
              json
            />
            <Selection
              name="siteKey"
              label="Site"
              value={this.state.siteKey}
              onChange={siteKey =>
                this.setState({
                  siteKey,
                  siteId: siteKey ? this.props.formStore.siteSelectorInfo.siteMap[siteKey] : ""
                })
              }
              options={[["<New Site>", ""], ...this.props.formStore.siteSelectorInfo.sites]}
            />
            {Maybe(
              !this.state.siteKey,
              <Input
                required
                name="newSiteKey"
                label="New Site Key"
                value={this.state.newSiteKey}
                onChange={newSiteKey => this.setState({newSiteKey})}
              />
            )}
            {Maybe(
              !this.state.siteId,
              <Input
                required
                name="newSiteId"
                label="New Site ID"
                value={this.state.newSiteId}
                onChange={newSiteId => this.setState({newSiteId})}
              />
            )}
          </div>
          <div className="asset-info-container section">
            <Checkbox
              name="createNewGroup"
              label="Add to Existing Group"
              value={this.state.addToGroup}
              onChange={addToGroup => this.setState({addToGroup})}
            />
            {Maybe(
              this.state.addToGroup,
              <Selection
                name="existingGroupAddress"
                value={this.state.existingGroupAddress}
                label="Group"
                onChange={existingGroupAddress => this.setState({existingGroupAddress})}
                options={this.props.formStore.siteSelectorInfo.groups}
              />
            )}
          </div>
          <div className="asset-info-container section">
            <Checkbox
              name="createNewGroup"
              label="Create New Group"
              value={this.state.createNewGroup}
              onChange={createNewGroup => this.setState({createNewGroup})}
            />
            {Maybe(
              this.state.createNewGroup,
              <Input
                name="accountName"
                label="New Group Name"
                value={this.state.newGroupName}
                onChange={newGroupName => this.setState({newGroupName})}
              />
            )}
          </div>

          <Action type="submit" className="wide">
            Create Access Code
          </Action>
        </div>
      </form>
    );
  }

  Form() {
    return (
      <React.Fragment>
        { this.Error() }
        { this.Result() }
        { this.CreateAccessKeyForm() }
        { this.RemoveAccessKeyForm() }
      </React.Fragment>
    );
  }

  render() {
    return (
      <AsyncComponent
        Load={async () => {
          await this.props.formStore.LoadSiteSelectorInfo();

          const siteKey = this.props.formStore.siteSelectorInfo.sites[0] || "";
          this.setState({
            siteKey,
            siteId: this.props.formStore.siteSelectorInfo.siteMap[siteKey] || "",
            existingGroupAddress: (this.props.formStore.siteSelectorInfo.groups[0] || [])[1]
          });
        }}
        render={this.Form}
      />
    );
  }
}

export default SiteAccessCode;
