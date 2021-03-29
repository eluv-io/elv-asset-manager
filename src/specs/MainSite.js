const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const mainSiteSelectorSpec = {
  name: "Main Live Site",
  version: "0.1",
  controls: [
    "images",
  ],
  availableAssetTypes: [
    "primary",
  ],
  availableTitleTypes: [
    "site-selector"
  ],
  "associated_assets": [
    {
      "name": "promo_videos",
      "indexed": true,
      "orderable": true,
      "slugged": false,
    },
    {
      "name": "featured_events",
      "indexed": true,
      "slugged": true,
      "orderable": true
    },
    {
      "name": "tenants",
      "indexed": false,
      "slugged": true,
    },
  ],
  "info_fields": [
    {
      "name": "mode",
      "type": "select",
      "options": ["test", "production"],
      "default_value": "test"
    },
    {
      "name": "site_images",
      "type": "subsection",
      "fields": [
        {
          "extensions": imageTypes,
          "label": "Eluvio Live Logo (Light)",
          "name": "eluvio_live_logo_light",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Eluvio Live Logo (Dark)",
          "name": "eluvio_live_logo_dark",
          "type": "file"
        }
      ]
    },
    {
      "fields": [
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "beautiful_quality",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "directly_to_fans",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "retain_control",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "push_boundaries",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "remonetize_endlessly",
          "type": "subsection"
        }
      ],
      "name": "images",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "text",
          "type": "textarea"
        },
        {
          "name": "image",
          "type": "file",
          "extensions": imageTypes
        }
      ],
      "name": "production_partners",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "text",
          "type": "textarea"
        },
        {
          "name": "image",
          "type": "file",
          "extensions": imageTypes
        }
      ],
      "name": "merchandise_partners",
      "type": "list"
    }
  ]
};

export default mainSiteSelectorSpec;
