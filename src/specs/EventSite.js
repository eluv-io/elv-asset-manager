const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const countryOptions = Object.values(require("country-codes-list").customList("countryNameEn", "{countryCode}: {countryNameEn}")).sort();
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();

const eventSiteSpec = {
  name: "Event Site",
  version: "0.11",
  associate_permissions: true,
  controls: [],
  availableAssetTypes: [
    "primary"
  ],
  availableTitleTypes: [
    "site"
  ],
  defaultImageKeys: [],
  localizations: [],
  fileControls: [],
  fileControlItems: {},
  associatedAssets: [
    {
      name: "promos",
      label: "Promos",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
    {
      name: "channels",
      label: "Channels",
      indexed: true,
      defaultable: true
    },
  ],
  infoFields: [
    {
      "name": "accessible",
      "type": "checkbox",
      "hint": "If specified, this site will be accessible in places it is featured, for example on the main page of live.eluv.io."
    },
    {
      "label": "Tenant ID",
      "name": "tenant_id",
      "type": "text"
    },
    {
      "label": "Base URL Slug",
      "name": "base_slug",
      "type": "text",
      "hint": "Base URL Slug for this site (e.g. https://live.eluv.io/<base_slug>/<site>) (Optional)"
    },
    {
      "name": "theme",
      "type": "select",
      "options": [
        "light",
        "dark"
      ]
    },
    {
      "fields": [
        {
          "name": "event_header",
          "type": "text"
        },
        {
          "name": "event_subheader",
          "type": "text"
        },
        {
          "name": "event_title",
          "type": "text"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "name": "date",
          "type": "datetime"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "copyright",
          "type": "textarea"
        }
      ],
      "name": "event_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "extensions": imageTypes,
          "name": "hero_background",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "hero_background_mobile",
          "label": "Hero Background (Mobile)",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Header Image (Dark)",
          "name": "header_dark",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Header Image (Light)",
          "name": "header_light",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_background",
          "type": "file",
          "label": "Main Background (TV)"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_logo",
          "type": "file",
          "label": "Main Logo (TV)"
        }
      ],
      "name": "event_images",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "fields": [
            {
              "hint": "A description displayed next to the 'Next' button when viewing the previous page.",
              "name": "page_title",
              "type": "text"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            },
            {
              "name": "text",
              "type": "rich_text"
            }
          ],
          "name": "pages",
          "type": "list"
        }
      ],
      "name": "event_descriptions",
      "type": "list"
    },
    {
      "fields": [
        {
          "fields": [
            {
              "name": "youtube",
              "type": "text"
            },
            {
              "name": "instagram",
              "type": "text"
            },
            {
              "name": "twitter",
              "type": "text"
            },
            {
              "name": "website",
              "type": "text"
            },
            {
              "name": "facebook",
              "type": "text"
            },
            {
              "name": "soundcloud",
              "type": "text"
            },
            {
              "name": "apple_music",
              "type": "text"
            },
            {
              "name": "spotify",
              "type": "text"
            }
          ],
          "name": "social_media_links",
          "type": "subsection"
        }
      ],
      "name": "artist_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        }
      ],
      "name": "sponsors",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "subheader",
          "type": "text"
        },
        {
          "name": "header",
          "type": "text"
        }
      ],
      "name": "stream_page",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "label": "Start Time",
          "name": "start_time",
          "type": "datetime"
        },
        {
          "label": "End Time",
          "name": "end_time",
          "type": "datetime"
        }
      ],
      "label": "Calendar Event",
      "name": "calendar",
      "type": "subsection"
    },
    {
      "name": "shipping_countries",
      "type": "multiselect",
      "hint": "Countries to which merchandise shipment is available",
      "default_value": ["US: United States of America"],
      "options": countryOptions
    },
    {
      "name": "payment_currencies",
      "type": "multiselect",
      "hint": "List of accepted currencies for tickets and merchandise",
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
          "label": "Item ID",
          "name": "uuid",
          "type": "uuid"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "label": "Item ID",
              "name": "uuid",
              "type": "uuid"
            },
            {
              "label": "NTP ID",
              "name": "otp_id",
              "type": "ntp_id"
            },
            {
              "name": "start_time",
              "type": "datetime"
            },
            {
              "name": "price",
              "type": "reference_subsection",
              "reference": "/payment_currencies",
              "value_type": "number",
              "hint": "Available price currencies are based on the 'Payment Currencies' field above",
            },
            {
              "name": "external_url",
              "hint": "External URL from which to purchase this ticket. If specified, the payment information below is not required."
            }
          ],
          "label": "SKUs",
          "name": "skus",
          "type": "list"
        }
      ],
      "name": "tickets",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "type",
          "options": [
            "merchandise",
            "donation"
          ],
          "type": "select"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "label": "Item ID",
          "name": "uuid",
          "type": "uuid"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            }
          ],
          "name": "images",
          "type": "list"
        },
        {
          "name": "price",
          "type": "reference_subsection",
          "reference": "/payment_currencies",
          "value_type": "number",
          "hint": "Available price currencies are based on the 'Payment Currencies' field above",
        },
        {
          "name": "featured",
          "type": "checkbox",
          "hint": "A featured item will be shown at checkout."
        },
        {
          "fields": [
            {
              "name": "name",
            },
            {
              "name": "type",
              "type": "select",
              "options": [
                "text",
                "color",
                "number"
              ]
            }
          ],
          "hint": "Specify the characteristics each variation of this product has, for example 'Size' and 'Color'",
          "name": "option_fields",
          "type": "list"
        },
        {
          "name": "product_options",
          "type": "reference_list",
          "reference": "./option_fields",
          "fields": [
            {
              "label": "SKU ID",
              "name": "uuid",
              "type": "uuid"
            }
          ]
        }
      ],
      "name": "products",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "release_date",
          "type": "datetime"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "name": "package",
          "type": "fabric_link"
        }
      ],
      "name": "extras",
      "type": "list"
    }
  ]
};

export default eventSiteSpec;
