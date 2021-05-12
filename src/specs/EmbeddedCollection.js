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
      "fields": [
        {
          "extensions": imageTypes,
          "name": "logo",
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
          "label": "Transfer Message",
          "name": "transfer_message",
          "type": "textarea"
        },
        {
          "label": "Transfer Terms",
          "name": "transfer_terms",
          "type": "rich_text"
        }
      ],
      "name": "transfer",
      "type": "subsection"
    }
  ]
};

export default EmbeddedCollectionSpec;
