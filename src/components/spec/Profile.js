import React from "react";
import {Action, Confirm, LabelledField, Selection} from "elv-components-js";
import {inject, observer} from "mobx-react";

import DefaultSpec from "@eluvio/elv-client-js/typeSpecs/Default";
import EventSiteSpec from "@eluvio/elv-client-js/typeSpecs/EventSite";
import DropEventSiteSpec from "@eluvio/elv-client-js/typeSpecs/DropEventSite";
import EventSiteExtrasSpec from "@eluvio/elv-client-js/typeSpecs/EventSiteExtras";
import EventTenantSpec from "@eluvio/elv-client-js/typeSpecs/EventTenant";
import MainSiteSpec from "@eluvio/elv-client-js/typeSpecs/MainSite";
import NFTCollectionSpec from "@eluvio/elv-client-js/typeSpecs/NFTCollection";
import NFTTemplateSpec from "@eluvio/elv-client-js/typeSpecs/NFTTemplate";
import MarketplaceSpec from "@eluvio/elv-client-js/typeSpecs/Marketplace";

const specs = {
  "Default": DefaultSpec,
  "Eluvio LIVE Drop Event Site": DropEventSiteSpec,
  "Eluvio LIVE Event Site": EventSiteSpec,
  "Eluvio LIVE Event Site Extras": EventSiteExtrasSpec,
  "Eluvio LIVE Main Site": MainSiteSpec,
  "Eluvio LIVE Marketplace": MarketplaceSpec,
  "Eluvio LIVE Tenant": EventTenantSpec,
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
