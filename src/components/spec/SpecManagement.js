import React from "react";
import {Action, Confirm, IconButton, Tabs} from "elv-components-js";
import {inject, observer} from "mobx-react";
import SettingsIcon from "../../static/icons/settings.svg";
import Info from "./Info";
import AssociatedAssets from "./AssociatedAssets";
import Controls from "./Controls";
import Localization from "./Localization";
import Profile from "./Profile";

@inject("rootStore")
@inject("specStore")
@observer
class SpecManagement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commitMessage: "",
      tab: "info",
      tabs: [
        ["Info Fields", "info"],
        ["Associated Assets", "associated_assets"],
        // NOTE: if image control is enabled it should allow configuration of default keys
        ["Controls", "controls"],
        ["Localization", "localization"],
        ["Load Profile", "profile"]
      ]
    };
  }

  Page() {
    switch (this.state.tab) {
      case "info":
        return <Info />;
      case "associated_assets":
        return <AssociatedAssets />;
      case "controls":
        return <Controls />;
      case "localization":
        return <Localization />;
      case "profile":
        return <Profile />;
    }
  }

  render() {
    return (
      <div className="asset-form">
        <div className="sticky app-header">
          <IconButton
            className="settings-icon active"
            title="Cancel app configuration"
            icon={SettingsIcon}
            onClick={() => this.props.rootStore.SetEditingConfiguration(false)}
          />
          <h1>
            App Configuration for Content Type '{this.props.rootStore.typeName}'
          </h1>
          <Action
            className="asset-form-save-button"
            onClick={async () => {
              await Confirm({
                message: "Are you sure you want to save your changes?",
                additionalInputs: [{
                  label: "Commit Message (optional)",
                  name: "commitMessage",
                  onChange: commitMessage => this.setState({commitMessage})
                }],
                onConfirm: async () => {
                  await this.props.specStore.SaveSpec({commitMessage: this.state.commitMessage});
                  this.setState({commitMessage: ""});
                }
              });
            }}
          >
            Save Spec
          </Action>
        </div>
        <Tabs
          className="asset-form-page-selection"
          selected={this.state.tab}
          onChange={tab => this.setState({tab})}
          options={this.state.tabs}
        />
        <div className="asset-form-container">
          { this.Page() }
        </div>
      </div>
    );
  }
}

export default SpecManagement;
