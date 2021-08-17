import React from "react";
import {Action, Confirm, LabelledField, Selection} from "elv-components-js";
import {inject, observer} from "mobx-react";

import DefaultSpec from "../../specs/Default";
import EventSiteSpec from "../../specs/EventSite";
import DropEventSiteSpec from "../../specs/DropEventSite";
import EventSiteExtrasSpec from "../../specs/EventSiteExtras";
import EventTenantSpec from "../../specs/EventTenant";
import MainSiteSpec from "../../specs/MainSite";
import NFTCollectionSpec from "../../specs/NFTCollection";
import NFTTemplateSpec from "../../specs/NFTTemplate";
import MarketplaceSpec from "../../specs/Marketplace";

const specs = {
  "Default": DefaultSpec,
  "Eluvio LIVE Event Site": EventSiteSpec,
  "Eluvio LIVE Drop Event Site": DropEventSiteSpec,
  "Eluvio LIVE Event Site Extras": EventSiteExtrasSpec,
  "Eluvio LIVE Tenant": EventTenantSpec,
  "Eluvio LIVE Main Site": MainSiteSpec,
  "Marketplace": MarketplaceSpec,
  "NFT Collection": NFTCollectionSpec,
  "NFT Template": NFTTemplateSpec
};

@inject("rootStore")
@inject("specStore")
@observer
class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      spec: ""
    };
  }

  render() {
    return (
      <div>
        <div className="asset-form-section-container">
          <h3>Select Configuration Profile</h3>
          <div className="asset-info-container">
            <Selection
              label="Profile"
              name="profile"
              options={[
                ["<Select a Configuration Profile>", ""],
                ...Object.keys(specs).map(spec => [spec, spec])
              ]}
              onChange={spec => this.setState({spec})}
            />
            <LabelledField label="">
              <Action
                onClick={() => Confirm({
                  message: "Are you sure you want to load this configuration profile?",
                  onConfirm: () => {
                    if(!this.state.spec) { return; }

                    this.props.specStore.InitializeSpec(specs[this.state.spec]);
                  }
                })}
              >
                Load
              </Action>
            </LabelledField>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
