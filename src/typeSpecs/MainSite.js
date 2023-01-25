const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const mainSiteSelectorSpec = {
  "profile": {
    name: "Main Site",
    version: "0.1",
  },
  manageApp: "default",
  controls: [
    "images",
  ],
  asset_types: [
    "primary",
  ],
  title_types: [
    "site-selector"
  ],
  "associated_assets": [
    {
      "name": "featured_events",
      "indexed": true,
      "slugged": true,
      "orderable": true
    },
    {
      "name": "tenants",
      "indexed": false,
      "slugged": true
    }
  ],
  "info_fields": [
    {
      "name": "marketplace_order",
      "type": "list",
      "hint": "Specify marketplace slugs. Any marketplaces not specified will be shown in a non-deterministic order after all specified marketplaces"
    },
    {
      "name": "domain_map",
      "label": "Domain Name Mapping",
      "type": "list",
      "fields": [
        {
          "name": "domain",
          "type": "text"
        },
        {
          "name": "tenant_slug",
          "type": "text"
        },
        {
          "name": "event_slug",
          "type": "text"
        },
      ]
    },
    {
      "name": "notification",
      "type": "subsection",
      "fields": [
        {
          "name": "active",
          "type": "checkbox",
        },
        {
          "name": "header",
          "type": "text"
        },
        {
          "name": "text",
          "type": "rich_text"
        }
      ]
    },
    {
      "label": "Partners & Ecosystem",
      "name": "header_partners",
      "type": "header"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "is_validator",
          "type": "checkbox"
        },
        {
          "name": "is_provider",
          "type": "checkbox"
        },
        {
          "name": "info",
          "type": "rich_text"
        }
      ],
      "name": "partners",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        }
      ],
      "name": "ecosystem",
      "type": "list"
    },
  ]
};

export default mainSiteSelectorSpec;
