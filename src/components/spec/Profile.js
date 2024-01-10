import React from "react";
import {Action, Confirm, LabelledField, Selection} from "elv-components-js";
import {inject, observer} from "mobx-react";

import DefaultSpec from "../../typeSpecs/Default";
import DropEventSiteSpec from "../../typeSpecs/DropEventSite";
import EventSiteExtrasSpec from "../../typeSpecs/EventSiteExtras";
import EventTenantSpec from "../../typeSpecs/EventTenant";
import MainSiteSpec from "../../typeSpecs/MainSite";
import NFTCollectionSpec from "../../typeSpecs/NFTCollection";
import NFTTemplateSpec from "../../typeSpecs/NFTTemplate";
import MarketplaceSpec from "../../typeSpecs/Marketplace";
import MediaCatalogSpec from "../../typeSpecs/MediaCatalog";

const specs = {
  "Default": DefaultSpec,
  "Eluvio Drop Event Site": DropEventSiteSpec,
  "Eluvio Event Site Extras": EventSiteExtrasSpec,
  "Eluvio Main Site": MainSiteSpec,
  "Eluvio Marketplace": MarketplaceSpec,
  "Eluvio Tenant": EventTenantSpec,
  "NFT Collection": NFTCollectionSpec,
  "NFT Template": NFTTemplateSpec,
  "Media Catalog": MediaCatalogSpec
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
