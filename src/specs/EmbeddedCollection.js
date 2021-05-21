const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const EmbeddedCollectionSpec = {
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
      "hint": "This text will appear in the form for transfering the NFT to Ethereum"
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
      "fields": [
        {
          "label": "UUID",
          "name": "uuid",
          "type": "uuid"
        },
        {
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text"
        },
        {
          "name": "base_hash",
          "label": "Base Content Hash",
          "type": "text"
        },
        {
          "name": "eth_locator",
          "label": "Ethereum Locator",
          "type": "text"
        },
        {
          "name": "cauth_id",
          "label": "Mint ID",
          "type": "text"
        },
        {
          "name": "fauth_id",
          "label": "Permissions ID",
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
