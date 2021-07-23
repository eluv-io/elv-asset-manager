const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const nftTemplateSpec = {
  "name": "NFT Template",
  "version": "0.1",
  "playable": true,
  "display_app": "default",
  "manage_app": "default",
  "hide_image_tab": true,
  "associate_permissions": false,
  "associated_assets": [],
  "controls": [],
  "availableAssetTypes": [
    "primary"
  ],
  "availableTitleTypes": [
    "nft_template"
  ],
  "defaultImageKeys": [],
  "fileControls": [],
  "fileControlItems": {},
  "infoFields": [
    {
      "name": "mint",
      "label": "Minting Info",
      "type": "subsection",
      "top_level": true,
      "fields": [
        {
          "name": "merge_meta",
          "label": "Merge Metadata",
          "type": "json"
        },
        {
          "name": "token_template",
          "label": "Token ID Template",
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
        },
      ]
    },
    {
      "name": "nft",
      "label": "NFT Details",
      "type": "subsection",
      "top_level": true,
      "fields": [
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
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text"
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "total_supply",
          "type": "integer"
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
          "version": true
        },
        {
          "name": "external_url",
          "label": "External URL",
          "type": "self_embed_url",
          "version": true
        },
        {
          "name": "background_color",
          "type": "color"
        },
        {
          "name": "enable_watermark",
          "type": "checkbox",
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
                  "type": "self_embed_url",
                  "version": true
                }
              ]
            }
          ]
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
                "file_url",
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
        }
      ]
    }
  ]
};

export default nftTemplateSpec;
