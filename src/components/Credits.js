import React from "react";
import {inject, observer} from "mobx-react";
import {Action, IconButton, Confirm, Input} from "elv-components-js";
import OrderButtons from "./OrderButtons";

import DeleteIcon from "../static/icons/trash.svg";
import AddUserIcon from "../static/icons/user-plus.svg";

@inject("formStore")
@observer
class CreditsGroup extends React.Component {
  render() {
    return (
      <div className="asset-form-credits-group">
        <div className="asset-form-credits-group-header">
          <h3>{this.props.group.group}</h3>
          <IconButton
            icon={DeleteIcon}
            className="remove-credit-group-button"
            title={`Remove credit group '${this.props.group.group}'`}
            onClick={() =>
              Confirm({
                message: "Are you sure you want to remove this credit group?",
                onConfirm: () => this.props.formStore.RemoveCreditGroup({
                  groupIndex: this.props.groupIndex
                })
              })
            }
          />
        </div>

        <div className="asset-form-credits-group-info">
          <Input
            name="Group Name"
            value={this.props.group.group}
            onChange={groupName => this.props.formStore.UpdateCreditGroup({
              groupIndex: this.props.groupIndex,
              key: "group",
              value: groupName
            })}
          />
          <Input
            name="Talent Type"
            value={this.props.group.talentType}
            onChange={talentType => this.props.formStore.UpdateCreditGroup({
              groupIndex: this.props.groupIndex,
              key: "talentType",
              value: talentType
            })}
          />
        </div>

        <div className="asset-form-credits">
          <div className="asset-form-credit">
            <label>Character</label>
            <label>First Name</label>
            <label>Last Name</label>
            <label>Other Credits</label>
            <label>Sales Display Order</label>
            <label/>
            <IconButton
              icon={AddUserIcon}
              className="add-credit-button"
              title="Add credit"
              onClick={() => this.props.formStore.AddCredit({
                groupIndex: this.props.groupIndex
              })}
            />
          </div>

          {this.props.group.credits.map((credit, index) =>
            <div
              key={`credits-group-${this.props.groupIndex}-${index}`}
              className="asset-form-credit"
            >
              <input
                name="character_name"
                placeholder="Character"
                value={credit.character_name}
                onChange={event => this.props.formStore.UpdateCredit({
                  groupIndex: this.props.groupIndex,
                  creditIndex: index,
                  key: "character_name",
                  value: event.target.value
                })}
              />
              <input
                name="talent_first_name"
                placeholder="First Name"
                value={credit.talent_first_name}
                onChange={event => this.props.formStore.UpdateCredit({
                  groupIndex: this.props.groupIndex,
                  creditIndex: index,
                  key: "talent_first_name",
                  value: event.target.value
                })}
              />
              <input
                name="talent_last_name"
                placeholder="Last Name"
                value={credit.talent_last_name}
                onChange={event => this.props.formStore.UpdateCredit({
                  groupIndex: this.props.groupIndex,
                  creditIndex: index,
                  key: "talent_last_name",
                  value: event.target.value
                })}
              />
              <input
                name="other_credits"
                placeholder="Other Credits"
                value={credit.other_credits}
                onChange={event => this.props.formStore.UpdateCredit({
                  groupIndex: this.props.groupIndex,
                  creditIndex: index,
                  key: "other_credits",
                  value: event.target.value
                })}
              />
              <input
                name="sales_display_order"
                placeholder="Sales Display Order"
                value={credit.sales_display_order}
                onChange={event => this.props.formStore.UpdateCredit({
                  groupIndex: this.props.groupIndex,
                  creditIndex: index,
                  key: "sales_display_order",
                  value: event.target.value
                })}
              />
              <OrderButtons
                index={index}
                length={this.props.group.credits.length}
                Swap={(i1, i2) => this.props.formStore.SwapCredit({
                  groupIndex: this.props.groupIndex,
                  i1,
                  i2
                })}
              />
              <IconButton
                icon={DeleteIcon}
                className="remove-credit-button"
                title="Remove credit"
                onClick={() =>
                  Confirm({
                    message: "Are you sure you want to remove this credit?",
                    onConfirm: () => this.props.formStore.RemoveCredit({
                      groupIndex: this.props.groupIndex,
                      creditIndex: index
                    })
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

@inject("formStore")
@observer
class Credits extends React.Component {
  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Credits</h3>
        <div className="asset-form-credits-container">
          {this.props.formStore.currentLocalizedData.credits.map((group, index) =>
            <CreditsGroup
              key={`credits-group-${index}`}
              group={group}
              groupIndex={index}
            />
          )}
        </div>
        <Action onClick={this.props.formStore.AddCreditGroup}>
          Add Credits Group
        </Action>
      </div>
    );
  }
}

export default Credits;
