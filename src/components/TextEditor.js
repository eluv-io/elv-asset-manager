import React from "react";
import RichTextEditor from "react-rte";
import {Action} from "elv-components-js";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      value: RichTextEditor.createValueFromString(props.value, "html")
    };
  }

  Editor() {
    if(!this.state.show) { return null; }

    return (
      <RichTextEditor
        className="rich-text-editor"
        value={this.state.value}
        onChange={content => {
          this.setState({
            value: content
          }, () => {
            const md = content.toString("markdown").replace("\n", "").trim();
            const value = md.length === 1 ? "" : content.toString("html");

            this.props.onChange(value);
          });
        }}
        toolbarConfig={{
          display: ["INLINE_STYLE_BUTTONS", "BLOCK_TYPE_DROPDOWN", "BLOCK_TYPE_BUTTONS", "LINK_BUTTONS", "HISTORY_BUTTONS"],
          INLINE_STYLE_BUTTONS: [
            {label: "Bold", style: "BOLD", className: "custom-css-class"},
            {label: "Italic", style: "ITALIC"}
          ],
          BLOCK_TYPE_DROPDOWN: [
            {label: "Normal", style: "unstyled"},
            {label: "Heading Large", style: "header-one"},
            {label: "Heading Medium", style: "header-two"},
            {label: "Heading Small", style: "header-three"},
            {label: "Heading Extra Small", style: "header-four"}
          ],
          BLOCK_TYPE_BUTTONS: [
            {label: "Block Quote", style: "blockquote"},
            {label: "UL", style: "unordered-list-item"},
            {label: "OL", style: "ordered-list-item"}
          ]
        }}
      />
    );
  }

  render () {
    return (
      <div className={`text-editor-component ${this.state.show ? "text-editor-component--active" : "text-editor-component--inactive"}`}>
        <div className="show-hide-button">
          <Action
            className={this.state.show ? "" : "secondary"}
            onClick={() => this.setState({show: !this.state.show})}
          >
            { this.state.show ? "Hide Editor" : "Show Editor" }
          </Action>
        </div>

        { this.Editor() }
      </div>
    );
  }
}

export default TextEditor;
