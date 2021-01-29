import React from "react";
import {inject, observer} from "mobx-react";
import {
  Input,
  Selection,
  Warning,
  Maybe
} from "elv-components-js";

import {InfoField} from "./Inputs";

@inject("formStore")
@observer
class AssetInfo extends React.Component {
  // Generate list of inputs as defined in infoFields
  InfoFields(assetInfo) {
    // Filter fields not applicable to current title type
    const fields = this.props.formStore.infoFields
      .filter(({for_title_types}) =>
        !for_title_types ||
        for_title_types.length === 0 ||
        for_title_types.includes(this.props.formStore.assetInfo.title_type)
      );

    return fields
      // Remove non-localized fields if localization is active
      .filter(field => !("localize" in field && !field.localize && this.props.formStore.localizationActive))
      .map(field =>
        InfoField({
          field,
          entry: assetInfo,
          Update: this.props.formStore.UpdateAssetInfo,
          localization: this.props.formStore.InfoFieldLocalization(field.name),
          textAddButton: true
        })
      );
  }

  render() {
    const assetInfo = this.props.formStore.currentLocalizedData.assetInfo;
    return (
      <div className="asset-form-section-container asset-info-section-container">
        <h3>Asset Info</h3>
        <div className="asset-info-container">
          {
            Maybe(
              !this.props.formStore.localizationActive,
              <Selection
                name="title_type"
                value={assetInfo.title_type}
                onChange={title_type => this.props.formStore.UpdateAssetInfo("title_type", title_type)}
                options={this.props.formStore.availableTitleTypes}
              />
            )
          }

          {
            Maybe(
              !this.props.formStore.localizationActive,
              <Selection
                name="asset_type"
                value={assetInfo.asset_type}
                onChange={asset_type => this.props.formStore.UpdateAssetInfo("asset_type", asset_type)}
                options={this.props.formStore.availableAssetTypes}
              />
            )
          }

          <Input
            name="title"
            value={assetInfo.title}
            onChange={title => this.props.formStore.UpdateAssetInfo("title", title)}
          />

          <Input
            name="display_title"
            value={assetInfo.display_title}
            onChange={display_title => this.props.formStore.UpdateAssetInfo("display_title", display_title)}
          />

          {
            Maybe(
              !this.props.formStore.localizationActive && this.props.formStore.slugWarning,
              <Warning message="Warning: Changing the slug will break any links to this object that contain the slug." />
            )
          }

          {
            Maybe(
              !this.props.formStore.localizationActive,
              <Input
                name="slug"
                value={this.props.formStore.assetInfo.slug}
                onChange={slug => this.props.formStore.UpdateAssetInfo("slug", slug)}
              />
            )
          }

          {
            Maybe(
              !this.props.formStore.localizationActive,
              <Input
                name="ip_title_id"
                label="IP Title ID"
                value={this.props.formStore.assetInfo.ip_title_id}
                onChange={ip_title_id => this.props.formStore.UpdateAssetInfo("ip_title_id", ip_title_id)}
              />
            )
          }

          { this.InfoFields(assetInfo) }
        </div>
      </div>
    );
  }
}

export default AssetInfo;
