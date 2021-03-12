import "../static/stylesheets/content-browser.scss";

import React from "react";
import AsyncComponent from "./AsyncComponent";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import {Action, Maybe, onEnterPressed} from "elv-components-js";

@observer
class BrowserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      version: 1,
      filter: "",
      lookup: "",
      lookupError: ""
    };
  }

  Pagination() {
    if(!this.props.paginated) { return null; }

    let pages = 1;
    if(this.props.paginationInfo) {
      const {items, limit} = this.props.paginationInfo;
      pages = Math.ceil(items / limit);
    }

    const ChangePage = (page) => {
      clearTimeout(this.pageChangeTimeout);

      this.setState({page});
      this.pageChangeTimeout = setTimeout(() => {
        this.setState({version: this.state.version + 1});
      }, 500);
    };

    return (
      <div className="browser-pagination">
        {Maybe(
          this.state.page > 1,
          <Action className="secondary prev-button" onClick={() => ChangePage(this.state.page - 1)}>
            Previous
          </Action>
        )}
        Page {this.state.page} of {pages}
        {Maybe(
          this.state.page < pages,
          <Action className="secondary next-button" onClick={() => ChangePage(this.state.page + 1)}>
            Next
          </Action>
        )}
      </div>
    );
  }

  Lookup() {
    const Lookup = async () => {
      this.setState({lookupError: ""});

      const { name, libraryId, objectId, versionHash, error } = await this.props.Lookup(this.state.lookup);

      if(error) {
        this.setState({lookupError: error});
        return;
      }

      this.props.QuickSelect({name, libraryId, objectId, versionHash});
    };

    return (
      <div className="lookup-container">
        <div className="lookup-error">{ this.state.lookupError }</div>
        <input
          name="lookup"
          placeholder="Find content by ID, version hash or address"
          className="browser-filter"
          onChange={event => {
            this.setState({lookup: event.target.value});
          }}
          value={this.state.lookup}
          onKeyPress={onEnterPressed(Lookup)}
        />
        <Action onClick={Lookup}>Search</Action>
      </div>
    );
  }

  Filter() {
    return (
      <input
        name="filter"
        placeholder="Filter..."
        className="browser-filter"
        onChange={event => {
          this.setState({filter: event.target.value});

          if(this.props.paginated) {
            clearTimeout(this.filterTimeout);

            this.filterTimeout = setTimeout(async () => {
              this.setState({page: 1, version: this.state.version + 1});
            }, 1000);
          }
        }}
        value={this.state.filter}
      />
    );
  }

  render() {
    let list = this.props.list || [];
    if(!this.props.paginated) {
      list = list.filter(({name}) => name.toLowerCase().includes(this.state.filter.toLowerCase()));
    }

    return (
      <div className="browser-container">
        <h3>{this.props.header}</h3>
        <h4>{this.props.subHeader}</h4>
        { this.Lookup() }
        { this.Pagination() }
        { this.Filter() }
        <AsyncComponent
          key={`browser-listing-version-${this.state.version}`}
          Load={() => this.props.Load({page: this.state.page, filter: this.state.filter})}
          render={() => (
            <ul className={`browser ${this.props.hashes ? "mono" : ""}`}>
              {list.map(({id, name, objectName, objectDescription, assetType, titleType}) => {
                let disabled =
                  (this.props.assetTypes && this.props.assetTypes.length > 0 && !this.props.assetTypes.includes(assetType)) ||
                  (this.props.titleTypes && this.props.titleTypes.length > 0 && !this.props.titleTypes.includes(titleType));

                let title = objectName ? `${objectName}\n\n${id}${objectDescription ? `\n\n${objectDescription}` : ""}` : id;
                if(disabled) {
                  title = title + "\n\nTitle type or asset type not allowed for this list:";
                  title = title + `\n\tTitle Type: ${titleType || "<not specified>"}`;
                  title = title + `\n\tAllowed Title Types: ${(this.props.titleTypes || []).join(", ")}`;
                  title = title + `\n\tAsset Type: ${assetType || "<not specified>"}`;
                  title = title + `\n\tAllowed Asset Types: ${(this.props.assetTypes || []).join(", ")}`;
                }

                return (
                  <li key={`browse-entry-${id}`}>
                    <button
                      disabled={disabled}
                      title={title}
                      onClick={() => this.props.Select({name, id})}
                    >
                      <div>{name}</div>
                      {assetType ? <div className="hint">{assetType} {titleType ? ` | ${titleType}` : ""}</div> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        />
      </div>
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
  hashes: PropTypes.bool,
  assetTypes: PropTypes.arrayOf(PropTypes.string),
  titleTypes: PropTypes.arrayOf(PropTypes.string),
  Load: PropTypes.func.isRequired,
  Select: PropTypes.func.isRequired,
  Lookup: PropTypes.func.isRequired,
  QuickSelect: PropTypes.func.isRequired,
  paginated: PropTypes.bool,
  paginationInfo: PropTypes.object
};

@inject("contentStore")
@observer
class ContentBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      libraryId: undefined,
      objectId: undefined,
      name: undefined
    };

    this.QuickSelect = this.QuickSelect.bind(this);
  }

  async QuickSelect({libraryId, objectId, versionHash}) {
    if(!objectId) {
      this.setState({libraryId});
      return;
    }

    await this.props.onComplete({libraryId, objectId, versionHash});
  }

  render() {
    let content;
    if(!this.state.libraryId) {
      content = (
        <React.Fragment>
          <div className="content-browser-actions">
            <Action
              className="back tertiary"
              onClick={this.props.onCancel}
            >
              Cancel
            </Action>
          </div>
          <BrowserList
            key="browser-list-libraries"
            header="Choose a library"
            list={this.props.contentStore.libraries}
            Load={this.props.contentStore.LoadLibraries}
            Select={({id}) => this.setState({libraryId: id})}
            Lookup={this.props.contentStore.LookupContent}
            QuickSelect={this.QuickSelect}
            paginated={false}
          />
        </React.Fragment>
      );
    } else if(!this.state.objectId) {
      const library = this.props.contentStore.libraries
        .find(({libraryId}) => libraryId === this.state.libraryId);

      let list = this.props.contentStore.objects[this.state.libraryId] || [];

      content = (
        <React.Fragment>
          <div className="content-browser-actions">
            <Action
              className="back secondary"
              onClick={() => this.setState({libraryId: undefined})}
            >
              Back
            </Action>
            <Action
              className="back tertiary"
              onClick={this.props.onCancel}
            >
              Cancel
            </Action>
          </div>
          <BrowserList
            key={`browser-list-${this.state.libraryId}`}
            header={library.name}
            list={list}
            paginated
            paginationInfo={this.props.contentStore.objectPaginationInfo[this.state.libraryId]}
            assetTypes={this.props.assetTypes}
            titleTypes={this.props.titleTypes}
            Load={async ({page, filter}) => await this.props.contentStore.LoadObjects({
              libraryId: this.state.libraryId,
              page,
              filter,
              assetTypes: this.props.assetTypes,
              titleTypes: this.props.titleTypes
            })}
            Select={async ({name, id}) => {
              if(this.props.objectOnly) {
                const versionHash = await this.props.contentStore.LatestVersionHash({objectId: id});

                await this.props.onComplete({
                  name,
                  libraryId: this.state.libraryId,
                  objectId: id,
                  versionHash
                });
              } else {
                this.setState({name, objectId: id});
              }
            }}
            Lookup={this.props.contentStore.LookupContent}
            QuickSelect={this.QuickSelect}
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
          <div className="content-browser-actions">
            <Action
              className="back secondary"
              onClick={() => this.setState({objectId: undefined})}
            >
              Back
            </Action>
            <Action
              className="back tertiary"
              onClick={this.props.onCancel}
            >
              Cancel
            </Action>
          </div>
          <BrowserList
            key={`browser-list-${this.state.objectId}`}
            header="Choose a version"
            subHeader={<React.Fragment><div>{library.name}</div><div>{object.name}</div></React.Fragment>}
            list={this.props.contentStore.versions[this.state.objectId]}
            hashes={true}
            Load={async () => await this.props.contentStore.LoadVersions(this.state.libraryId, this.state.objectId)}
            Select={async ({id}) => await this.props.onComplete({
              name: this.state.name,
              libraryId: this.state.libraryId,
              objectId: this.state.objectId,
              versionHash: id
            })}
            Lookup={this.props.contentStore.LookupContent}
            QuickSelect={this.QuickSelect}
            paginated={false}
          />
        </React.Fragment>
      );
    }

    return (
      <div className="content-browser">
        <h2>{this.props.header}</h2>
        { content }
      </div>
    );
  }
}

ContentBrowser.propTypes = {
  header: PropTypes.string,
  assetTypes: PropTypes.arrayOf(PropTypes.string),
  titleTypes: PropTypes.arrayOf(PropTypes.string),
  playableOnly: PropTypes.bool,
  objectOnly: PropTypes.bool,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ContentBrowser;
