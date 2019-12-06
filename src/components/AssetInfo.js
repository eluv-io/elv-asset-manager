import React from "react";
import {inject, observer} from "mobx-react";

@inject("formStore")
@observer
class AssetInfo extends React.Component {
  Input(infoKey) {
    return (
      <div className="asset-form-input">
        <label htmlFor={infoKey}>{infoKey}</label>
        <input
          name={infoKey}
          value={this.props.formStore.assetInfo[infoKey]}
          onChange={event => this.props.formStore.UpdateAssetInfo(infoKey, event.target.value)}
        />
      </div>
    );
  }

  TextArea(infoKey) {
    return (
      <div className="asset-form-input">
        <label htmlFor={infoKey}>{infoKey}</label>
        <textarea
          name={infoKey}
          value={this.props.formStore.assetInfo[infoKey]}
          onChange={event => this.props.formStore.UpdateAssetInfo(infoKey, event.target.value)}
        />
      </div>
    );
  }

  Selection(infoKey, options) {
    return (
      <div className="asset-form-input">
        <label htmlFor={infoKey}>{infoKey}</label>
        <select
          name={infoKey}
          value={this.props.formStore.assetInfo[infoKey]}
          onChange={event => this.props.formStore.UpdateAssetInfo(infoKey, event.target.value)}
        >
          {options.map(option =>
            <option value={option} key={`asset-info-${option}`}>{option}</option>
          )}
        </select>
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Asset Info</h3>
        <div className="asset-info-container">
          { this.Input("title") }
          { this.Input("ip_title_id") }
          { this.TextArea("synopsis") }
          { this.Selection("title_type", ["episode", "feature", "franchise", "series"])}
          { this.Selection("asset_type", ["clip", "primary", "trailer"])}
        </div>
      </div>
    );
  }
}

export default AssetInfo;
