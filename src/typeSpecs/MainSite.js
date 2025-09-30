const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const mainSiteSelectorSpec = {
  "profile": {
    name: "Main Site",
    version: "1.0",
  },
  manageApp: "default",
  hide_image_tab: true,
  associate_permissions: false,
  show_searchables_tab: true,
  controls: [],
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
      "default_value": "test",
      "name": "mode",
      "options": [
        "test",
        "production"
      ],
      "type": "select"
    },
    {
      "name": "media_property_order",
      "type": "list",
      "hint": "Specify media property slugs or object IDs. Any property not specified will be shown in a non-deterministic order after all specified properties",
      "buttonText": "Add Property Slug or Id"
    },
    {
      "name": "marketplace_order",
      "type": "list",
      "hint": "Specify marketplace slugs. Any marketplaces not specified will be shown in a non-deterministic order after all specified marketplaces",
      "buttonText": "Add Marketplace Slug"
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
        {
          "name": "property_slug",
          "type": "text"
        },
        {
          "name": "google_site_verification_id",
          "label": "Google Site Verification ID",
          "type": "text"
        }
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
          "name": "plain_text",
          "type": "textarea"
        },
        {
          "name": "link_text",
          "type": "text"
        },
        {
          "name": "link",
          "type": "text"
        }
      ]
    },
    {
      "name": "videos",
      "type": "subsection",
      "fields": [
        {
          "name": "main_page_video",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "creators_page_video",
          "type": "fabric_link",
          "video_preview": true
        },
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
          "name": "link",
          "type": "text"
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
        },
        {
          "name": "link",
          "type": "text"
        }
      ],
      "name": "ecosystem",
      "type": "list"
    },
    {
      "label": "News",
      "name": "header_news",
      "type": "header"
    },
    {
      "name": "news",
      "type": "list",
      "fields": [
        {
          "name": "date",
          "type": "date"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "full_title",
          "type": "textarea",
          "hint": "Replaces title in news item view, in case the full title is too long for the list view."
        },
        {
          "name": "slug",
          "label": "URL Slug",
          "type": "text"
        },
        {
          "name": "external_link",
          "type": "text"
        },
        {
          "name": "text",
          "type": "rich_text"
        },
        {
          "name": "images",
          "type": "list",
          "fields": [
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes,
            },
            {
              "name": "caption",
              "type": "text"
            }
          ]
        },
        {
          "name": "videos",
          "type": "list",
          "fields": [
            {
              "name": "video",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "caption",
              "type": "text"
            }
          ]
        }
      ]
    },
    {
      "label": "Release Notes",
      "name": "header_release_notes",
      "type": "header"
    },
    {
      "fields": [
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "date",
          "type": "date"
        },
        {
          "name": "text",
          "type": "rich_text"
        },
        {
          "name": "initially_expanded",
          "type": "checkbox",
          "hint": "Unless checked, this entry will be initially contracted unless it is the most recent"
        }
      ],
      "name": "release_notes",
      "type": "list"
    }
  ]
};

export default mainSiteSelectorSpec;
