import {Action} from "elv-components-js";
import React from "react";

/* Pagination, sorting and filtering */

// To be called in class constructor - sets up state and methods for PSF
export const InitPSF = function({sortKey, perPage=100, additionalState={}}) {
  this.state = {
    page: 1,
    perPage,
    filter: "",
    activeFilter: "",
    sortKey: sortKey,
    sortAsc: true,
    ...additionalState
  };

  this.Filter = Filter.bind(this);
  this.PageControls = PageControls.bind(this);
  this.ChangePage = ChangePage.bind(this);
  this.Paged = Paged.bind(this);
  this.HandleFilterChange = HandleFilterChange.bind(this);
  this.SortableHeader = SortableHeader.bind(this);
  this.ChangeSort = ChangeSort.bind(this);
};

export const SortableHeader = function(key, label, f) {
  return (
    <div
      onClick={() => this.ChangeSort(key, f)}
      className={`sortable-header ${key === this.state.sortKey ? "active" : ""} ${this.state.sortAsc ? "asc" : "desc"}`}
    >
      {label}
    </div>
  );
};

export const ChangeSort = function(key, f) {
  if(this.state.sortKey === key) {
    this.setState({sortAsc: !this.state.sortAsc, sortFunction: f});
  } else {
    this.setState({sortKey: key, sortAsc: true, sortFunction: f});
  }
};

export const PageControls = function(total, onChange) {
  const startIndex = (this.state.page - 1) * this.state.perPage + 1;
  let range = "No results";

  if(total) {
    range = `${ startIndex } - ${ Math.min(total, startIndex + this.state.perPage - 1) } of ${ total }`;
  }

  return (
    <div className="controls page-controls centered">
      <Action disabled={this.state.page === 1} onClick={() => this.ChangePage(this.state.page - 1, onChange)}>Previous</Action>
      { range }
      <Action disabled={this.state.page * this.state.perPage >= total} onClick={() => this.ChangePage(this.state.page + 1, onChange)}>Next</Action>
    </div>
  );
};

export const ChangePage = function(page, onChange) {
  this.setState({page}, onChange);
};

export const Paged = function(list) {
  const startIndex = (this.state.page - 1) * this.state.perPage;

  return list.slice(startIndex, startIndex + this.state.perPage);
};

export const HandleFilterChange = function(event, onChange) {
  clearTimeout(this.filterTimeout);

  this.setState({filter: event.target.value});

  this.filterTimeout = setTimeout(() => {
    this.setState({activeFilter: this.state.filter});
    this.ChangePage(1, onChange);
  }, 250);
};

export const Filter = function(placeholder, onChange) {
  return (
    <input
      className="filter"
      name="filter"
      value={this.state.filter}
      onChange={event => this.HandleFilterChange(event, onChange)}
      placeholder={placeholder}
    />
  );
};
