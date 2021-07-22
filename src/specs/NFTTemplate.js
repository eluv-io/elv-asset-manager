const languageOptions = require("./LanguageCodes").default;
const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const nftTemplateSpec = {
  name: "NFT Template",
  version: "0.1",
  playable: true,
  displayApp: "default",
  manageApp: "default",
  associate_permissions: false,
  associated_assets: [],
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
      "name": "tenant_id",
      "label": "Tenant ID",
      "type": "text",
      "no_localize": true
    },
    {
      "name": "name",
      "type": "text"
    },
    {
      "name": "display_name",
      "type": "text"
    },
    {
      "name": "description",
      "type": "textarea"
    },
    {
      "label": "Token ID",
      "name": "token_id",
      "type": "text"
    },
    {
      "name": "creator",
      "type": "text"
    },
    {
      "name": "copyright",
      "type": "text"
    },
    {
      "name": "created_at",
      "type": "datetime"
    },
    {
      "extensions": imageTypes,
      "name": "image",
      "type": "file_url",
      "hint": "Square image recommended"
    },
    {
      "name": "embed_url",
      "label": "Embed URL",
      "type": "self_embed_url",
      "hint": "URL can be generated on https://embed.v3.contentfabric.io",
      "no_localize": true
    },
    {
      "name": "external_url",
      "label": "External URL",
      "type": "self_embed_url",
      "no_localize": true
    },
    {
      "name": "background_color",
      "type": "color"
    },
    {
      "name": "enable_watermark",
      "type": "checkbox",
      "no_localize": true
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
      "no_localize": true,
      "top_level": true,
      "fields": [
        {
          "name": "total_supply",
          "type": "integer"
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "merge_meta",
          "label": "Merge Metadata",
          "type": "json"
        },
        {
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text"
        },
        {
          "name": "cauth_id",
          "label": "Mint Key ID",
          "type": "text"
        },
        {
          "name": "fauth_id",
          "label": "Fabric Key ID",
          "type": "text"
        }
      ]
    },
    {
      "name": "marketplace_attributes",
      "type": "subsection",
      "no_localize": true,
      "fields": [
        {
          "name": "opensea",
          "label": "OpenSea",
          "type": "subsection",
          "fields": [
            {
              "name": "youtube_url",
              "type": "self_embed_url"
            }
          ]
        }
      ]
    }
  ]
};

export default nftTemplateSpec;
