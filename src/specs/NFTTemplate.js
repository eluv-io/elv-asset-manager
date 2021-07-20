const languageOptions = require("./LanguageCodes").default;
const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const nftTemplateSpec = {
  name: "NFT Template",
  version: "0.1",
  playable: true,
  displayApp: "default",
  manageApp: "default",
  associate_permissions: false,
  controls: [],
  availableAssetTypes: [
    "primary"
  ],
  availableTitleTypes: [
    "nft_template"
  ],
  defaultImageKeys: [],
  localization: {
    localizations: Object.keys(languageOptions)
  },
  fileControls: [],
  fileControlItems: {},
  infoFields: [
    {
      "name": "name",
      "type": "text"
    },
    {
      "name": "description",
      "type": "textarea"
    },
    {
      "extensions": imageTypes,
      "name": "image",
      "type": "file",
      "hint": "Square image recommended"
    },
    {
      "name": "external_url",
      "label": "External URL",
      "type": "text"
    },
    {
      "name": "embed_url",
      "label": "Embed URL",
      "type": "text",
      "hint": "URL can be generated on https://embed.v3.contentfabric.io"
    },
    {
      "name": "background_color",
      "type": "color"
    },
    {
      "name": "enable_watermark",
      "type": "checkbox"
    },
    {
      "name": "attributes",
      "label": "Custom Attributes",
      "type": "list",
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "type",
          "type": "select",
          "default_value": "text",
          "options": [
            "checkbox",
            "color",
            "datetime",
            "fabric_link",
            "file",
            "integer",
            "json",
            "number",
            "text",
            "textarea",
            "uuid"
          ]
        },
        {
          "name": "value",
          "type": "reference_type",
          "reference": "./type"
        }
      ]
    },
    {
      "name": "nft",
      "label": "NFT Details",
      "type": "subsection",
      "fields": [
        {
          "name": "contract_address",
          "type": "text"
        },
        {
          "name": "total_supply",
          "type": "integer"
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "merge_metadata",
          "type": "json"
        },
        {
          "name": "base_content_object",
          "type": "fabric_link",
          "hint": "By default, this object is the base content object"
        }
      ]
    },
    {
      "name": "marketplace_attributes",
      "type": "subsection",
      "fields": [
        {
          "name": "opensea",
          "label": "OpenSea",
          "type": "subsection",
          "fields": [
            {
              "name": "youtube_url",
              "type": "text",
              "hint": "Can be the same as Embed URL, above"
            }
          ]
        }
      ]
    }
  ]
};

export default nftTemplateSpec;
