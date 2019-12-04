import React from "react";
import AsyncComponent from "./AsyncComponent";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import Action from "elv-components-js/src/components/Action";

@observer
class BrowserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: ""
    };

    this.List = this.List.bind(this);
  }

  List() {
    return (
      <div className="browser-container">
        <h3>{this.props.header}</h3>
        <h4>{this.props.subHeader}</h4>
        <input
          name="filter"
          placeholder="Filter..."
          className="browser-filter"
          onChange={event => this.setState({filter: event.target.value})}
          value={this.state.filter}
        />
        <ul className="browser">
          {(this.props.list || [])
            .filter(({name}) => name.toLowerCase().includes(this.state.filter.toLowerCase()))
            .map(({id, name}) => {
              return (
                <li key={`browse-entry-${id}`}>
                  <button onClick={() => this.props.Select(id)}>
                    { name }
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <AsyncComponent
        Load={this.props.Load}
        render={this.List}
      />
    );
  }
}

BrowserList.propTypes = {
  header: PropTypes.string.isRequired,
  subHeader: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  list: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })
  ),
  Load: PropTypes.func.isRequired,
  Select: PropTypes.func.isRequired
};

@inject("contentStore")
@observer
class ContentBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      libraryId: undefined,
      objectId: undefined
    };
  }

  render() {
    let content;
    if(!this.state.libraryId) {
      content = (
        <BrowserList
          key="browser-list-libraries"
          header="Choose a library"
          list={this.props.contentStore.libraries}
          Load={this.props.contentStore.LoadLibraries}
          Select={libraryId => this.setState({libraryId})}
        />
      );
    } else if(!this.state.objectId) {
      const library = this.props.contentStore.libraries
        .find(({libraryId}) => libraryId === this.state.libraryId);

      let list = this.props.contentStore.objects[this.state.libraryId] || [];
      if(this.props.assetTypes && this.props.assetTypes.length > 0) {
        list = list.filter(item => this.props.assetTypes.includes(item.assetType));
      }

      content = (
        <React.Fragment>
          <Action
            className="back secondary"
            onClick={() => this.setState({libraryId: undefined})}
          >
            Back
          </Action>
          <BrowserList
            key={`browser-list-${this.state.libraryId}`}
            header="Choose an object"
            subHeader={library.name}
            list={list}
            Load={async () => await this.props.contentStore.LoadObjects(this.state.libraryId)}
            Select={objectId => this.setState({objectId})}
          />
        </React.Fragment>
      );
    } else {
      const library = this.props.contentStore.libraries
        .find(({libraryId}) => libraryId === this.state.libraryId);
      const object = this.props.contentStore.objects[this.state.libraryId]
        .find(({objectId}) => objectId === this.state.objectId);

      content = (
        <React.Fragment>
          <Action
            className="back secondary"
            onClick={() => this.setState({objectId: undefined})}
          >
            Back
          </Action>
          <BrowserList
            key={`browser-list-${this.state.objectId}`}
            header="Choose a version"
            subHeader={<React.Fragment><div>{library.name}</div><div>{object.name}</div></React.Fragment>}
            list={this.props.contentStore.versions[this.state.objectId]}
            Load={async () => await this.props.contentStore.LoadVersions(this.state.libraryId, this.state.objectId)}
            Select={versionHash => this.props.onComplete({
              libraryId: this.state.libraryId,
              objectId: this.state.objectId,
              versionHash
            })}
          />
        </React.Fragment>
      );
    }

    return (
      <div className="content-browser">
        <h2>{this.props.header}</h2>
        { content}
      </div>
    );
  }
}

ContentBrowser.propTypes = {
  header: PropTypes.string,
  assetTypes: PropTypes.arrayOf(PropTypes.string),
  playableOnly: PropTypes.bool,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ContentBrowser;
