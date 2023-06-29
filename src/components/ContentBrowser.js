import "../static/stylesheets/content-browser.scss";

import React from "react";
import AsyncComponent from "./AsyncComponent";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import {Action, Confirm, LoadingElement, onEnterPressed} from "elv-components-js";

@inject("contentStore")
@observer
class BrowserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      version: 1,
      filter: "",
      lookup: "",
      lookupError: "",
      selected: []
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
        <Action className={`secondary prev-button ${this.state.page > 1 ? "visible" : "hidden"}`} onClick={() => ChangePage(this.state.page - 1)}>
          Previous
        </Action>

        {
          this.FilteredList().length > 0 ?
            `Page ${this.state.page} of ${pages}` : null
        }

        <Action className={`secondary next-button ${this.state.page < pages ? "visible" : "hidden"}`} onClick={() => ChangePage(this.state.page + 1)}>
          Next
        </Action>
      </div>
    );
  }

  Lookup() {
    const Lookup = async () => {
      this.setState({lookupError: ""});

      const { name, libraryId, objectId, versionHash, error } = await this.props.contentStore.LookupContent(this.state.lookup);

      if(error) {
        this.setState({lookupError: error});
        return;
      }

      this.props.QuickSelect({
        name,
        libraryId,
        objectId,
        versionHash,
        confirm: true
      });
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

  FilteredList = () => {
    let list = this.props.list || [];

    if(!this.props.paginated) {
      list = list.filter(({name}) => name.toLowerCase().includes(this.state.filter.toLowerCase()));
    }

    return list;
  };

  Submit = () => {
    if(!this.props.multiple) { return; }

    return (
      <div className="actions-container">
        <Action
          onClick={async () => {
            await this.props.Select({
              selected: this.state.selected
            });
          }}
        >Submit</Action>
      </div>
    );
  };

  ListView = () => {
    if(this.FilteredList().length === 0) {
      return <div className="no-results">No results</div>;
    }

    return (
      <ul className={`browser ${this.props.hashes ? "mono" : ""}`}>
        {this.FilteredList().map(props => {
          const {id, name, objectName, objectDescription, assetType, titleType} = props;
          let disabled =
            (this.props.assetTypes && this.props.assetTypes.length > 0 && !this.props.assetTypes.includes(assetType)) ||
            (this.props.titleTypes && this.props.titleTypes.length > 0 && !this.props.titleTypes.includes(titleType)) ||
            (this.props.SetDisabled && typeof this.props.SetDisabled === "function" && this.props.SetDisabled(props));

          let title = objectName ? `${objectName}\n\n${id}${objectDescription ? `\n\n${objectDescription}` : ""}` : id;
          if(disabled) {
            if(this.props.disabledText) {
              title = title + `\n\n${this.props.disabledText}`;
            }

            if(!this.props.hideDefaultDisabledText) {
              title = title + "\n\nTitle type or asset type not allowed for this list:";
              title = title + `\n\tTitle Type: ${titleType || "<not specified>"}`;

              if(this.props.titleTypes && this.props.titleTypes.length > 0) {
                title = title + `\n\tAllowed Title Types: ${this.props.titleTypes.join(", ")}`;
              }

              title = title + `\n\tAsset Type: ${assetType || "<not specified>"}`;

              if(this.props.assetTypes && this.props.assetTypes.length > 0) {
                title = title + `\n\tAllowed Asset Types: ${this.props.assetTypes.join(", ")}`;
              }
            }

          }

          const selected = (this.state.selected || []).includes(id);
          const isLibraryObject = id.startsWith("ilib");

          return (
            <li className={`list-entry${selected ? " selected" : ""}`} key={`browse-entry-${id}`}>
              <button
                disabled={disabled}
                title={title}
                onClick={() => {
                  if(this.props.multiple && !isLibraryObject) {
                    if(!selected) {
                      this.setState({selected: this.state.selected.concat([id])});
                    } else {
                      this.setState({selected: this.state.selected.filter(otherId => otherId !== id)});
                    }
                  } else {
                    this.props.Select({name, id});
                  }
                }}
              >
                <div>{name}</div>
                {assetType ? <div className="hint">{assetType} {titleType ? ` | ${titleType}` : ""}</div> : null}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    return (
      <div className="browser-container">
        { this.Lookup() }
        { this.Filter() }
        <h3>{this.props.header}</h3>
        <h4>{this.props.subHeader}</h4>
        { this.Pagination() }
        { this.Submit() }
        <AsyncComponent
          key={`browser-listing-version-${this.state.version}`}
          Load={() => this.props.Load({page: this.state.page, filter: this.state.filter})}
          render={this.ListView}
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
  multiple: PropTypes.bool,
  hashes: PropTypes.bool,
  assetTypes: PropTypes.arrayOf(PropTypes.string),
  titleTypes: PropTypes.arrayOf(PropTypes.string),
  Load: PropTypes.func.isRequired,
  Select: PropTypes.func.isRequired,
  QuickSelect: PropTypes.func.isRequired,
  paginated: PropTypes.bool,
  paginationInfo: PropTypes.object,
  SetDisabled: PropTypes.func,
  disabledText: PropTypes.string,
  hideDefaultDisabledText: PropTypes.bool
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

    this.Update = this.Update.bind(this);
  }

  async Update({name, libraryId, objectId, versionHash, offering, confirm=false}) {
    this.setState({loading: true});

    try {
      const complete =
        libraryId &&
        objectId &&
        versionHash &&
        (!this.props.offering || offering);

      if(complete) {
        if(!name) {
          name = (await this.props.contentStore.LookupContent(versionHash || objectId)).name;
        }

        if(confirm) {
          await Confirm({
            message: `Are you sure you want to select ${name}?`,
            onConfirm: async () => {
              await this.props.onComplete({name, libraryId, objectId, versionHash, offering});
            },
            onCancel: () => {
              name = undefined;
              libraryId = undefined;
              objectId = undefined;
              versionHash = undefined;
              offering = undefined;
            }
          });
        } else {
          await this.props.onComplete({name, libraryId, objectId, versionHash, offering});
        }
      }

      this.setState({
        name,
        libraryId,
        objectId,
        versionHash,
        offering
      });
    } finally {
      this.setState({loading: false});
    }
  }

  BrowseLibraries() {
    return (
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
          Select={async ({id}) => await this.Update({libraryId: id})}
          QuickSelect={this.Update}
          paginated={false}
          multiple={this.props.multiple}
        />
      </React.Fragment>
    );
  }

  BrowseObjects() {
    const library = this.props.contentStore.libraries
      .find(({libraryId}) => libraryId === this.state.libraryId);

    let list = this.props.contentStore.objects[this.state.libraryId] || [];

    return (
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
          Select={async ({id, selected}) => {
            if(this.props.multiple) {
              const versionHashes = await Promise.all(
                selected.map(async objectId => this.props.contentStore.LatestVersionHash(({objectId})))
              );
              await this.props.onComplete({
                libraryId: this.state.libraryId,
                objectIds: selected,
                versionHashes
              });
            } else {
              let versionHash;
              if(this.props.objectOnly) {
                versionHash = await this.props.contentStore.LatestVersionHash({objectId: id});
              }

              await this.Update({libraryId: this.state.libraryId, objectId: id, versionHash});
            }}
          }

          QuickSelect={this.Update}
          multiple={this.props.multiple}
          SetDisabled={this.props.SetDisabled}
          disabledText={this.props.disabledText}
          hideDefaultDisabledText={this.props.hideDefaultDisabledText}
        />
      </React.Fragment>
    );
  }

  BrowseVersions() {
    const library = this.props.contentStore.libraries
      .find(({libraryId}) => libraryId === this.state.libraryId);
    const object = this.props.contentStore.objects[this.state.libraryId]
      .find(({objectId}) => objectId === this.state.objectId);

    return (
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
          Select={async ({id}) => await this.Update({libraryId: this.state.libraryId, objectId: this.state.objectId, versionHash: id})}
          QuickSelect={this.Update}
          multiple={this.props.multiple}
          paginated={false}
        />
      </React.Fragment>
    );
  }

  BrowseOfferings() {
    const library = this.props.contentStore.libraries
      .find(({libraryId}) => libraryId === this.state.libraryId);
    const object = this.props.contentStore.objects[this.state.libraryId]
      .find(({objectId}) => objectId === this.state.objectId);

    return (
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
          key={`browser-list-${this.state.objectId}-offerings`}
          header="Choose an offering"
          subHeader={<React.Fragment><div>{library.name}</div><div>{object.name}</div></React.Fragment>}
          list={this.props.contentStore.offerings[this.state.objectId]}
          Load={async () => await this.props.contentStore.LoadOfferings(this.state.objectId, this.state.versionHash)}
          Select={async ({id}) => await this.Update({libraryId: this.state.libraryId, objectId: this.state.objectId, versionHash: this.state.versionHash, offering: id})}
          QuickSelect={this.Update}
          paginated={false}
        />
      </React.Fragment>
    );
  }

  render() {
    let content;
    if(this.state.loading) {
      content = <div className="browser-container loading"><LoadingElement loading /></div>;
    } else if(!this.state.libraryId) {
      content = this.BrowseLibraries();
    } else if(!this.state.objectId) {
      content = this.BrowseObjects();
    } else if(!this.state.versionHash && !this.props.objectOnly) {
      content = this.BrowseVersions();
    } else if(this.props.offering) {
      content = this.BrowseOfferings();
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
  offering: PropTypes.bool,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  SetDisabled: PropTypes.func,
  disabledText: PropTypes.string,
  hideDefaultDisabledText: PropTypes.bool
};

export default ContentBrowser;
