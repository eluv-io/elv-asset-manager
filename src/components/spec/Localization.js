import React from "react";
import {inject, observer} from "mobx-react";

@inject("specStore")
@observer
class Localization extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Localization Options</h3>
        <div className="asset-info-container">
          Localization
        </div>
      </div>
    );
  }
}

export default Localization;
