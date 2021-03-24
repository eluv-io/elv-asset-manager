import React from "react";
import {inject, observer} from "mobx-react";

import {RecursiveField} from "../Inputs";

@inject("vodChannelStore")
@observer
class VoDChannel extends React.Component {
  Offerings() {
    return (
      <div className="vod-channel__offerings">
        <RecursiveField
          orderable
          list

          HEAD={this.props.vodChannelStore.offerings}
          name="offerings"
          fields={[
            // { name: "type", type: "select", options: ["ch_vod"] },
            { name: "offering_key" },
            { name: "display_name" },
            { name: "description", type: "textarea" },
            { name: "display_image", type: "file", extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp"] },
            {
              name: "items",
              label: "Playlist",
              type: "list",
              buttonText: "Add Item",
              fields: [
                { name: "display_name" },
                // { name: "type", type: "select", options: ["mez_vod"] },
                { name: "source_ref", label: "Source", type: "fabric_link", offering: true, version: false }
              ]
            }
          ]}
          values={this.props.vodChannelStore.offerings}
          Update={this.props.vodChannelStore.UpdateOfferings}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="asset-form-section-container vod-channel">
        <h3 className="live-header">
          Channel Management
        </h3>

        { this.Offerings() }
      </div>
    );
  }
}

export default VoDChannel;
