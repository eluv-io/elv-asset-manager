import React from "react";
import PropTypes from "prop-types";
import {inject, observer} from "mobx-react";
import PrettyBytes from "pretty-bytes";
import UrlJoin from "url-join";
import URI from "urijs";
import Path from "path";
import {IconButton, ImageIcon, Modal} from "elv-components-js";
import AsyncComponent from "./AsyncComponent";
import PreviewIcon from "./PreviewIcon";

import AddFileIcon from "../static/icons/file-plus.svg";
import DirectoryIcon from "../static/icons/directory.svg";
import FileIcon from "../static/icons/file.svg";
import BackIcon from "../static/icons/directory_back.svg";

class FileBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: ".",
      displayPath: "/",
      showUpload: false
    };
  }

  CurrentDirectory() {
    let files = this.props.files || {};

    if(this.state.path === ".") {
      return files;
    }

    this.state.path
      .replace("./", "")
      .split("/")
      .forEach(directory => files = files[directory]);

    return files;
  }

  ChangeDirectory(dirname) {
    dirname = Path.normalize(dirname);

    this.setState({
      path: dirname,
      displayPath: dirname === "." ? "/" : "/" + dirname,
    });
  }

  FileUrl(path, filename) {
    const uri = URI(this.props.baseFileUrl);

    uri.path(UrlJoin(uri.path(), path, filename).replace("//", "/"));

    return uri.toString();
  }

  FileIcon(name) {
    const extension = name.split(".").pop();
    const mimeType = (this.props.mimeTypes || {})[extension] || "";
    const isImage =
      mimeType.startsWith("image") ||
      ["apng", "gif", "jpg", "jpeg", "png", "svg", "tif", "tiff", "webp"].includes(extension);

    if(!isImage) {
      return <ImageIcon icon={FileIcon} label="File"/>;
    }

    return (
      <PreviewIcon
        imageKey={name}
        imagePath={UrlJoin(this.state.path, name)}
        targetHash={this.props.versionHash}
      />
    );
  }

  File(name, info) {
    if(this.props.extensions && this.props.extensions.length > 0) {
      if(!this.props.extensions.includes(name.split(".").pop())) {
        return;
      }
    }

    const size = PrettyBytes(info.size || 0);
    return (
      <tr
        key={`entry-${this.state.path}-${name}`}
        className="selectable-file"
        tabIndex={0}
        onClick={() => this.props.Select(UrlJoin(this.state.path, name).replace(/^\.\//, ""))}
      >
        <td className="item-icon">
          { this.FileIcon(name) }
        </td>
        <td title={name}>{ name }</td>
        <td title={size} className="info-cell">{ size }</td>
      </tr>
    );
  }

  Directory(item) {
    const changeDirectory = () => this.ChangeDirectory(UrlJoin(this.state.path, item.name));
    return (
      <tr key={`entry-${this.state.path}-${item.name}`} className="directory" onClick={changeDirectory} onKeyPress={changeDirectory}>
        <td className="item-icon">
          <ImageIcon icon={DirectoryIcon} label="Directory" />
        </td>
        <td tabIndex="0" title={item.name}>{item.name}</td>
        <td className="info-cell">{(Object.keys(item.item).length - 1) + " Items"}</td>
      </tr>
    );
  }

  Items() {
    const currentDirectory = this.CurrentDirectory();

    const items = Object.keys(currentDirectory)
      .filter(name => name !== ".")
      .map(name => {
        return {
          name,
          item: currentDirectory[name],
          info: currentDirectory[name]["."],
        };
      });

    if(items.length === 0) {
      return (
        <tr><td/><td>No files</td><td/><td/></tr>
      );
    }

    // Sort items - directory first, then case-insensitive alphabetical order
    return (
      items.sort((item1, item2) => {
        if(item1.info.type !== item2.info.type) {
          if(item1.info.type === "directory") {
            return -1;
          } else {
            return 1;
          }
        } else {
          return item1.name.toLowerCase() < item2.name.toLowerCase() ? -1 : 1;
        }
      }).map(item => item.info.type === "directory" ? this.Directory(item): this.File(item.name, item.info))
    );
  }

  render() {
    let backButton;
    if(this.state.path && this.state.path !== Path.dirname(this.state.path)) {
      backButton = (
        <IconButton
          icon={BackIcon}
          label={"Back"}
          onClick={() => this.ChangeDirectory(Path.dirname(this.state.path))}
        />
      );
    }

    return (
      <div className="file-browser-container">
        <h3>{this.props.header}</h3>
        <table>
          <thead>
            <tr>
              <th className="type-header">{backButton}</th>
              <th title={"Current Directory: " + this.state.displayPath} tabIndex="0">{this.state.displayPath}</th>
              <th className="size-header" />
            </tr>
          </thead>
          <tbody>
            { this.Items() }
          </tbody>
        </table>
      </div>
    );
  }
}

FileBrowser.propTypes = {
  header: PropTypes.string,
  baseFileUrl: PropTypes.string.isRequired,
  extensions: PropTypes.arrayOf(PropTypes.string),
  files: PropTypes.object.isRequired,
  mimeTypes: PropTypes.object,
  Select: PropTypes.func.isRequired
};

@inject("contentStore")
@observer
class FileSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
    };

    this.Selection = this.Selection.bind(this);
    this.SelectFile = this.SelectFile.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
  }

  SelectFile(imagePath) {
    this.props.Select(imagePath);
    this.CloseModal();
  }

  ActivateModal() {
    this.setState({
      modal: (
        <Modal
          className="asset-form-modal"
          closable={true}
          OnClickOutside={this.CloseModal}
        >
          <FileBrowser
            header={this.props.header}
            Select={this.SelectFile}
            versionHash={this.props.versionHash}
            baseFileUrl={this.props.contentStore.baseFileUrls[this.props.versionHash]}
            files={this.props.contentStore.files[this.props.versionHash]}
            mimeTypes={this.props.contentStore.mimeTypes[this.props.versionHash]}
            extensions={this.props.extensions}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: null});
  }

  Selection() {
    return (
      <div className="file-selection">
        <IconButton
          onClick={this.ActivateModal}
          title="Select a file"
          icon={AddFileIcon}
        />
        { this.state.modal }
      </div>
    );
  }

  render() {
    return (
      <AsyncComponent
        Load={() => this.props.contentStore.LoadFiles(this.props.versionHash)}
        render={this.Selection}
      />
    );
  }
}

FileSelection.propTypes = {
  header: PropTypes.string,
  extensions: PropTypes.arrayOf(PropTypes.string),
  versionHash: PropTypes.string.isRequired,
  Select: PropTypes.func.isRequired
};

export default FileSelection;

