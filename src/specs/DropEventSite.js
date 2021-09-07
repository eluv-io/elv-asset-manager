const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const languageOptions = require("./LanguageCodes").default;

const eventSiteSpec = {
  name: "Eluvio LIVE Drop Event Site",
  version: "0.1",
  manageApp: "default",
  associate_permissions: true,
  "hide_image_tab": true,
  controls: [],
  availableAssetTypes: [
    "primary"
  ],
  availableTitleTypes: [
    "site"
  ],
  defaultImageKeys: [],
  localization: {
    localizations: Object.keys(languageOptions)
  },
  fileControls: [],
  fileControlItems: {},
  associatedAssets: [],
  infoFields: [
    {
      "label": "Eluvio LIVE Tenant",
      "name": "tenant",
      "type": "fabric_link",
      "hash_only": true,
      "no_localize": true
    },
    {
      "name": "marketplace",
      "type": "fabric_link",
      "hash_only": true,
      "no_localize": true
    },
    {
      "name": "type",
      "type": "text",
      "default_value": "drop_event",
      "readonly": true
    },
    {
      "name": "state",
      "type": "select",
      "no_localize": true,
      "options": [
        "Inaccessible",
        "Available",
        "Ended"
      ],
      "default_value": "Inaccessible",
      "hint": "Specify the current state of the event. Inaccessible and ended events will not be visible to users."
    },
    {
      "name": "theme",
      "type": "select",
      "options": [
        "light",
        "dark"
      ],
      "no_localize": true,
    },
    {
      "name": "localizations",
      "label": "Localizations",
      "type": "multiselect",
      "no_localize": true,
      "hint": "Additional languages to support",
      "options": Object.keys(languageOptions)
    },
    {
      "fields": [
        {
          "label": "Event Info on Hero Image",
          "name": "hero_info",
          "type": "checkbox",
          "hint": "Check this box if your event info is in your hero image. This will reduce the gradient and omit the text, allowing for more visible real estate on the hero image."
        },
        {
          "name": "event_title",
          "type": "text",
          "hint": "The title of the page in the browser"
        },
        {
          "name": "feature_header",
          "type": "text",
          "hint": "Displayed when the event is featured on the main page"
        },
        {
          "name": "event_header",
          "type": "text",
          "hint": "Displayed on the main event page"
        },
        {
          "name": "event_subheader",
          "type": "text",
          "hint": "Displayed on the main event page"
        },
        {
          "name": "date_subheader",
          "type": "text",
          "hint": "Displayed on the main page and event page"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "copyright",
          "type": "textarea"
        },
        {
          "name": "modal_message_get_started",
          "label": "Modal Message (Get Started)",
          "type": "subsection",
          "hint": "If specified, this message will be displayed in a popup modal the 'Get Started' button is pressed. You can use this to communicate event info before they create or sign in to their wallet.",
          "fields": [
            {
              "name": "show",
              "type": "checkbox",
              "hint": "The message box will only be displayed if this is checked"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "message",
              "type": "rich_text"
            }
          ]
        }
      ],
      "name": "event_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
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
          "name": "hero_video",
          "type": "fabric_link",
          "video_preview": true
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
      "name": "promo_videos",
      "type": "list",
      "fields": [
        {
          "name": "video",
          "type": "fabric_link",
          "video_preview": true
        }
      ]
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "link",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "label": "Image (for light background)",
          "name": "image",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Image (for dark background)",
          "name": "image_light",
          "type": "file"
        }
      ],
      "name": "sponsors",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "header_image",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "header_text",
          "type": "text"
        },
        {
          "name": "hide_countdown",
          "type": "checkbox"
        },
        {
          "name": "message_1",
          "type": "textarea",
          "hint": "Message above the countdown. Default: 'Your Code is Redeemed. Drop Begins In'"
        },
        {
          "name": "message_2",
          "type": "textarea",
          "hint": "Message below the countdown. Default: 'Use the link in your code email to return here at the time of the drop.'"
        }
      ],
      "name": "event_landing_page",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "uuid",
          "label": "Drop ID",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "event_header",
          "type": "text",
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "event_image",
          "type": "file",
          "extensions": imageTypes,
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "drop_header",
          "type": "text",
          "hint": "Displayed on the drop event page"
        },
        {
          "name": "drop_subheader",
          "type": "text",
          "hint": "Displayed on the drop event page"
        },
        {
          "name": "start_date",
          "type": "datetime",
          "no_localize": true
        },
        {
          "name": "end_date",
          "type": "datetime",
          "no_localize": true
        },
        {
          "name": "stream",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "votable",
          "type": "checkbox",
          "hint": "If specified, users will be able to vote on the available NFTs",
          "default_value": true
        },
        {
          "name": "store_filters",
          "type": "list",
          "hint": "After the drop, the wallet panel will be redirected to the store. Use these fields to filter the items shown"
        },
        {
          "name": "nfts",
          "label": "NFTs",
          "type": "list",
          "hint": "NFTs available in this drop",
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "sku",
              "label": "SKU",
              "type": "text",
              "hint": "Find NFT SKUs in the associated Marketplace",
            }
          ]
        },
        {
          "name": "modal_message_start",
          "label": "Modal Message (Event Start)",
          "type": "subsection",
          "hint": "If specified, this message will be displayed in a popup modal when the event is opened. You can use this to communicate event info to your users as they enter the event.",
          "fields": [
            {
              "name": "show",
              "type": "checkbox",
              "hint": "The message box will only be displayed if this is checked"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "message",
              "type": "rich_text"
            }
          ]
        },
        {
          "name": "modal_message_end",
          "label": "Modal Message (Event End)",
          "type": "subsection",
          "hint": "If specified, this message will be displayed in a popup modal when the event has ended. You can use this to communicate event info to at the end of the event.",
          "fields": [
            {
              "name": "show",
              "type": "checkbox",
              "hint": "The message box will only be displayed if this is checked"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "message",
              "type": "rich_text"
            }
          ]
        }
      ],
      "name": "drops",
      "type": "list"
    },
    {
      "name": "analytics_ids",
      "label": "Analytics IDs",
      "type": "list",
      "no_localize": true,
      "hint": "Specify IDs for your own analytics",
      "fields": [
        {
          "name": "label",
          "type": "text",
          "hint": "A label for this collection of analytics"
        },
        {
          "name": "ids",
          "label": "IDs",
          "type": "list",
          "fields": [
            {
              "name": "type",
              "type": "select",
              "options": [
                "Google Analytics ID",
                "Google Tag Manager ID",
                "Google Conversion ID",
                "Google Conversion Label",
                "Facebook Pixel ID",
                "App Nexus Segment ID",
                "App Nexus Pixel ID",
                "TradeDoubler Organization ID",
                "TradeDoubler Event ID",
              ]
            },
            {
              "name": "id",
              "label": "ID",
              "type": "text"
            }
          ]
        }
      ]
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "images",
          "type": "list",
          "fields": [{
            "name": "image",
            "type": "file",
            "extensions": imageTypes
          }]
        },
        {
          "name": "organizers",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "url",
              "label": "URL",
              "type": "text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            }
          ]
        }
      ],
      "label": "Search Listing Info",
      "name": "search_data",
      "type": "subsection",
      "hint": "This information will be used to populate data used by search engines for displaying this event",
      "no_localize": true
    }
  ]
};

export default eventSiteSpec;
