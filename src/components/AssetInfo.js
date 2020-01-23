import React from "react";
import {inject, observer} from "mobx-react";
import {Input, TextArea, Selection} from "./Inputs";

@inject("formStore")
@observer
class AssetInfo extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Asset Info</h3>
        <div className="asset-info-container">
          <Input
            name="title"
            value={this.props.formStore.assetInfo.title}
            onChange={title => this.props.formStore.UpdateAssetInfo("title", title)}
          />

          <Input
            name="display_title"
            value={this.props.formStore.assetInfo.display_title}
            onChange={display_title => this.props.formStore.UpdateAssetInfo("display_title", display_title)}
          />

          <Input
            name="slug"
            value={this.props.formStore.assetInfo.slug}
            onChange={slug => this.props.formStore.UpdateAssetInfo("slug", slug)}
          />

          <Input
            name="ip_title_id"
            label="IP Title ID"
            value={this.props.formStore.assetInfo.ip_title_id}
            onChange={ip_title_id => this.props.formStore.UpdateAssetInfo("ip_title_id", ip_title_id)}
          />

          <TextArea
            name="synopsis"
            value={this.props.formStore.assetInfo.synopsis}
            onChange={synopsis => this.props.formStore.UpdateAssetInfo("synopsis", synopsis)}
          />

          <Input
            name="original_broadcaster"
            value={this.props.formStore.assetInfo.original_broadcaster}
            onChange={original_broadcaster => this.props.formStore.UpdateAssetInfo("original_broadcaster", original_broadcaster)}
          />

          <Selection
            name="title_type"
            value={this.props.formStore.assetInfo.title_type}
            onChange={title_type => this.props.formStore.UpdateAssetInfo("title_type", title_type)}
            options={["episode", "feature", "franchise", "series"]}
          />

          <Selection
            name="asset_type"
            value={this.props.formStore.assetInfo.asset_type}
            onChange={asset_type => this.props.formStore.UpdateAssetInfo("asset_type", asset_type)}
            options={["clip", "primary", "trailer"]}
          />
        </div>
      </div>
    );
  }
}

export default AssetInfo;
