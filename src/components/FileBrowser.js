import React from "react";
import PropTypes from "prop-types";
import {inject, observer} from "mobx-react";
import Utils from "@eluvio/elv-client-js/src/Utils";
import PrettyBytes from "pretty-bytes";
import UrlJoin from "url-join";
import URI from "urijs";
import Path from "path";
import {Action, IconButton, ImageIcon, Modal} from "elv-components-js";
import AsyncComponent from "./AsyncComponent";
import PreviewIcon from "./PreviewIcon";
import ContentBrowser from "./ContentBrowser";

import ObjectIcon from "../static/icons/box.svg";
import AddFileIcon from "../static/icons/file-plus.svg";
import DirectoryIcon from "../static/icons/directory.svg";
import FileIcon from "../static/icons/file.svg";
import EncryptedFileIcon from "../static/icons/encrypted-file.svg";
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

  FileIcon(name, info) {
    const encrypted = info.encryption && info.encryption.scheme === "cgck";
    const extension = (name.split(".").pop() || "").toLowerCase();
    const mimeType = (this.props.mimeTypes || {})[extension] || "";
    const isImage =
      mimeType.startsWith("image") ||
      ["apng", "gif", "ico", "jpg", "jpeg", "png", "svg", "webp"].includes(extension);

    if(encrypted) {
      return <ImageIcon icon={EncryptedFileIcon} className={encrypted ? "encrypted-file-icon" : ""} label="Encrypted File"/>;
    } else if(!isImage) {
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
      if(!this.props.extensions.includes((name.split(".").pop() || "").toString().toLowerCase())) {
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
          { this.FileIcon(name, info) }
        </td>
        <td title={decodeURI(name)}>{ decodeURI(name) }</td>
        <td title={size} className="info-cell">{ size }</td>
      </tr>
    );
  }

  Directory(item) {
    const changeDirectory = () => this.ChangeDirectory(UrlJoin(this.state.path, item.name));
    const name = decodeURI(item.name);
    return (
      <tr key={`entry-${this.state.path}-${name}`} className="directory" onClick={changeDirectory} onKeyPress={changeDirectory}>
        <td className="item-icon">
          <ImageIcon icon={DirectoryIcon} label="Directory" />
        </td>
        <td tabIndex="0" title={name}>{name}</td>
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
@inject("rootStore")
@observer
class FileSelection extends React.Component {
  constructor(props) {
    super(props);

    // If versionHash is an older version of this object, use latest for file browsing
    let versionHash = props.versionHash || this.props.rootStore.params.versionHash;
    if(versionHash && Utils.DecodeVersionHash(versionHash).objectId === this.props.rootStore.params.objectId) {
      versionHash = this.props.rootStore.params.versionHash;
    }

    this.state = {
      modal: () => null,
      versionHash,
      selectingObject: false
    };

    this.Selection = this.Selection.bind(this);
    this.SelectFile = this.SelectFile.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
    this.FileBrowser = this.FileBrowser.bind(this);
    this.ObjectSelection = this.ObjectSelection.bind(this);
  }

  SelectFile(path) {
    this.props.Select({path, imagePath: path, targetHash: this.state.versionHash});
    this.CloseModal();
  }

  ObjectSelection() {
    if(!this.state.selectingObject) {
      return (
        <IconButton
          className="file-browser-object-select-button"
          onClick={() => this.setState({selectingObject: true})}
          title="Select a different object"
          icon={ObjectIcon}
        />
      );
    }

    return (
      <ContentBrowser
        onComplete={
          async ({versionHash}) => {
            await this.props.contentStore.LoadFiles(versionHash);
            this.setState({
              selectingObject: false,
              versionHash
            });
          }
        }
        onCancel={
          () => this.setState({selectingObject: false})
        }
      />
    );
  }

  FileBrowser() {
    if(this.state.selectingObject) { return null; }

    return (
      <FileBrowser
        header={this.props.header}
        Select={this.SelectFile}
        files={this.props.contentStore.files[this.state.versionHash]}
        versionHash={this.state.versionHash}
        baseFileUrl={this.props.contentStore.baseFileUrls[this.state.versionHash]}
        mimeTypes={this.props.contentStore.mimeTypes[this.state.versionHash]}
        extensions={this.props.extensions}
      />
    );
  }

  ActivateModal() {
    this.setState({
      modal: () => (
        <Modal
          className="asset-form-modal"
          closable={true}
          OnClickOutside={this.CloseModal}
        >
          { this.ObjectSelection() }
          { this.FileBrowser() }
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({modal: () => null});
  }

  Selection() {
    if(this.props.useButton) {
      return (
        <>
          <Action className="file-selection" onClick={this.ActivateModal} title="Select a file">
            { this.props.buttonText || "Select a File"}
          </Action>
          { this.state.modal() }
        </>
      );
    }

    return (
      <>
        <IconButton
          className="file-selection"
          onClick={this.ActivateModal}
          title="Select a file"
          icon={AddFileIcon}
        />
        { this.state.modal() }
      </>
    );
  }

  render() {
    return (
      <AsyncComponent
        Load={async () => {
          await this.props.contentStore.LoadFiles(this.state.versionHash);
          if(this.props.versionHash && this.props.versionHash !== this.state.versionHash) {
            await this.props.contentStore.LoadFiles(this.props.versionHash);
          }
        }}
        render={this.Selection}
      />
    );
  }
}

FileSelection.propTypes = {
  header: PropTypes.string,
  extensions: PropTypes.arrayOf(PropTypes.string),
  versionHash: PropTypes.string,
  useButton: PropTypes.bool,
  buttonText: PropTypes.string,
  Select: PropTypes.func.isRequired
};

export default FileSelection;

