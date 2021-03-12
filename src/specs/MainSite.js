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
