const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();

const EmbeddedCollectionSpec = {
  manageApp: "default",
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "collection"
  ],
  "associated_assets": [
    {
      "defaultable": false,
      "for_title_types": [],
      "indexed": false,
      "label": "",
      "name": "items",
      "orderable": true,
      "slugged": false,
      "title_types": []
    }
  ],
  "info_fields": [
    {
      "name": "public_title",
      "type": "text",
    },
    {
      "name": "public_description",
      "type": "textarea",
    },
    {
      "name": "header",
      "type": "text"
    },
    {
      "name": "description",
      "type": "textarea"
    },
    {
      "name": "footer_text",
      "type": "textarea"
    },
    {
      "name": "transfer_message",
      "type": "textarea",
      "hint": "This text will appear in the form for transferring the NFT to Ethereum"
    },
    {
      "fields": [
        {
          "extensions": imageTypes,
          "name": "logo",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "background",
          "type": "file"
        }
      ],
      "name": "images",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "label": "Tenant ID",
          "name": "tenant_id",
          "type": "text"
        },
        {
          "label": "NTP ID",
          "name": "ntp_id",
          "type": "text"
        }
      ],
      "name": "access",
      "type": "subsection"
    },
    {
      "name": "payment_currencies",
      "type": "multiselect",
      "no_localize": true,
      "hint": "List of accepted currencies",
      "default_value": ["USD"],
      "options": currencyOptions
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "label": "UUID",
          "name": "uuid",
          "type": "uuid"
        },
        {
          "name": "price",
          "type": "reference_subsection",
          "no_localize": true,
          "reference": "/payment_currencies",
          "value_type": "number",
          "hint": "Available price currencies are based on the 'Payment Currencies' field above",
        },
        {
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text"
        },
        {
          "name": "base_template",
          "type": "fabric_link",
          "no_localize": true,
          "version": true
        },
        {
          "name": "eth_locator",
          "label": "Ethereum Locator",
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
        {
          "name": "token_template",
          "label": "NFT Token Template",
          "type": "text"
        },
        {
          "name": "merge_meta",
          "label": "Metadata",
          "type": "textarea"
        },
      ],
      "name": "nft",
      "label": "NFT",
      "type": "subsection"
    }
  ]
};

export default EmbeddedCollectionSpec;
