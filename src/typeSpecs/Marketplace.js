const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const currencies = require("country-codes-list").customList("currencyCode", "{currencyNameEn}");
const languageOptions = require("./LanguageCodes").default;
const currencyOptions = Object.keys(currencies)
  //.filter((code, index, self) => self.findIndex(otherName => name.toLowerCase() === otherName.toLowerCase()) === index)
  //.map(name => [name || (currencies[name] === "VES" ? "Venezuelan Bolívar" : currencies[name]), currencies[name]])
  .filter(code => code && currencies[code])
  .map(code => [currencies[code], code])
  .sort((a, b) => a < b ? -1 : 1);

const ebanxSupportedCountries = [
  ["Argentina", "AR"],
  ["Bolivia", "BO"],
  ["Brazil", "BR"],
  ["Chile", "CL"],
  ["Colombia", "CO"],
  ["Ecuador", "EC"],
  ["El Salvador", "SV"],
  ["Guatemala", "GT"],
  ["Mexico", "MX"],
  ["Panama", "PA"],
  ["Paraguay", "PY"],
  ["Peru", "PE"],
  ["Uruguay", "UY"]
];

const MarketplaceSpec = {
  "profile": {
    "name": "Eluvio LIVE Marketplace",
    "version": "0.3",
  },
  "manageApp": "default",
  "hide_image_tab": true,
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "marketplace"
  ],
  localization: {
    localizations: Object.keys(languageOptions)
  },
  "controls": [],
  "associated_assets": [],
  "show_marketplace_preview_link": true,
  "info_fields": [
    {
      "label": "Branding and Customization",
      "name": "header_branding",
      "type": "header"
    },
    {
      "name": "tenant_id",
      "label": "Tenant ID",
      "type": "text",
      "no_localize": true,
    },
    {
      "name": "tenant_slug",
      "type": "text",
      "required": true,
      "no_localize": true,
    },
    {
      "name": "tenant_name",
      "type": "text",
      "required": true,
      "no_localize": true,
    },
    {
      "label": "Preview Password",
      "name": "preview_password_digest",
      "type": "password",
      "hint": "Set a password to prevent viewing of unpublished changes by unauthorized users",
      "no_localize": true,
    },
    {
      "name": "branding",
      "type": "subsection",
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "show",
          "label": "Show in Global Marketplace",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
        },
        {
          "name": "external_link",
          "type": "text",
          "hint": "If specified, the icon for this marketplace in the global marketplace view will link to this URL"
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
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "header_logo",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This logo will be displayed in the header when browsing your marketplace"
        },
        {
          "name": "header_image",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This image will be displayed in the header when browsing your marketplace, in place of the marketplace name"
        },
        {
          "name": "card_banner_front",
          "label": "Card Banner (Front)",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This banner will be displayed in the list of available marketplaces."
        },
        {
          "name": "card_banner_back",
          "label": "Card Banner (Back)",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This banner will be displayed in the list of available marketplaces."
        },
        {
          "label": "App Background",
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "App Background (Mobile)",
          "name": "background_mobile",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "TV Assets",
          "name": "tv",
          "type": "subsection",
          "fields": [
            {
              "name": "logo",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "header_image",
              "type": "file",
              "extensions": imageTypes
            }
          ]
        },
        {
          "name": "disable_secondary_market",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
          "hint": "If specified, listings, activity and other secondary market pages will not be accessible in your marketplace"
        },
        {
          "name": "hide_leaderboard",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
        },
        {
          "name": "hide_global_navigation",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, the global navigation to all listings and marketplaces will not be shown when this marketplace is embedded into your site",
          "no_localize": true,
        },
        {
          "label": "Hide Marketplace Name on Store Page",
          "name": "hide_name",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
        },
        {
          "name": "hide_secondary_in_store",
          "label": "Hide Secondary Sales Stats in Store",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
        },
        {
          "name": "disable_usdc",
          "label": "Disable USDC Connections",
          "hint": "If specified, the option to for users to connect their Eluvio wallets to USDC wallets will be hidden in your marketplace",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true,
        },
        {
          "name": "tabs",
          "type": "subsection",
          "hint": "Specify different text to be used for links in the header. If blank, default values will be used",
          "fields": [
            {
              "name": "store",
              "type": "text"
            },
            {
              "name": "stores",
              "type": "text"
            },
            {
              "name": "listings",
              "type": "text"
            },
            {
              "name": "my_items",
              "type": "text"
            }
          ]
        },
        {
          "name": "additional_marketplaces",
          "type": "list",
          "hint": "Additional marketplaces to associate with this one. These marketplaces will show as a dropdown list in the main store navigation link.",
          "no_localize": true,
          "fields": [
            {
              "name": "tenant_slug",
              "type": "text",
              "hint": "The slug of the tenant in which the marketplace is defined"
            },
            {
              "name": "marketplace_slug",
              "type": "text",
              "hint": "The slug of the marketplace"
            }
          ]
        },
        {
          "name": "tags",
          "type": "multiselect",
          "hint": "These tags will be used to help users discover your marketplace based on their interests.",
          "no_localize": true,
          "options": [
            "Film",
            "Music",
            "Software",
            "TV"
          ]
        },
        {
          "name": "text_justification",
          "type": "select",
          "default_value": "Left",
          "no_localize": true,
          "options": [
            "Left",
            "Center"
          ]
        },
        {
          "name": "item_text_justification",
          "type": "select",
          "default_value": "Left",
          "no_localize": true,
          "options": [
            "Left",
            "Center"
          ]
        },
        {
          "label": "Theme",
          "name": "color_scheme",
          "type": "select",
          "default_value": "Light",
          "no_localize": true,
          "options": [
            "Light",
            "Dark",
            "Custom"
          ]
        },
        {
          "label": "Custom CSS",
          "name": "custom_css",
          "no_localize": true,
          "type": "textarea",
          "depends_on": "./color_scheme",
          "depends_on_value": "Custom",
          "hint": "The wallet application has a number of CSS variables that can be modified to easily change fonts, colors, borders, and other attributes. Click here to see the full list.",
          "hint_link": "https://github.com/eluv-io/elv-media-wallet/blob/custom-styling/src/static/stylesheets/themes/default.css",
          "default_value":
`:root {

}`
        },
        {
          "name": "use_tenant_styling",
          "label": "Use Tenant Styling",
          "hint": "If specified, the custom CSS from the tenant object will be used on non-marketplace specific pages such as listings and in the user's profile",
          "type": "checkbox",
          "default_value": false
        }
      ]
    },
    {
      "name": "login_customization",
      "label": "Login Customization",
      "type": "subsection",
      "fields": [
        {
          "label": "Login Page Logo",
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "Login Page Background",
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "'Powered By' Logo",
          "name": "powered_by_logo",
          "type": "file",
          "hint": "Customize the 'Powered By' logo at the bottom of the login box",
          "extensions": imageTypes,
          "depends_on": "./logo"
        },
        {
          "name": "background_mobile",
          "label": "Login Page Background (Mobile)",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "large_logo_mode",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, the logo in the login box will be significantly larger, but *the background image will NOT be visible in the Live app*."
        },
        {
          "name": "log_in_button",
          "type": "subsection",
          "unless": "../branding/color_scheme",
          "unless_value": "Custom",
          "fields": [
            {
              "name": "text_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#FFFFFF"
              }
            },
            {
              "name": "background_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#0885fb"
              }
            },
            {
              "name": "border_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#0885fb"
              }
            }
          ]
        },
        {
          "name": "sign_up_button",
          "type": "subsection",
          "unless": "../branding/color_scheme",
          "unless_value": "Custom",
          "fields": [
            {
              "name": "text_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#000000"
              }
            },
            {
              "name": "background_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#FFFFFF"
              }
            },
            {
              "name": "border_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#000000"
              }
            }
          ]
        },
        {
          "label": "Require Consent for Email Collection",
          "name": "require_consent",
          "type": "checkbox",
          "default_value": true
        },
        {
          "label": "Consent by Default",
          "name": "default_consent",
          "type": "checkbox",
          "default_value": true,
          "depends_on": "./require_consent"
        },
        {
          "name": "custom_consent",
          "type": "subsection",
          "fields": [
            {
              "label": "Use Custom Consent Options",
              "name": "enabled",
              "type": "checkbox",
              "default_value": false,
              "no_localize": true
            },
            {
              "name": "type",
              "type": "select",
              "options": [
                "Modal",
                "Checkboxes"
              ]
            },
            {
              "name": "consent_modal_header",
              "type": "textarea",
              "depends_on": "./enabled",
              "unless": "./type",
              "unless_value": "Checkboxes"
            },
            {
              "name": "button_text",
              "type": "text",
              "hint": "Default: 'I Accept'",
              "depends_on": "./enabled",
              "unless": "./type",
              "unless_value": "Checkboxes"
            },
            {
              "label": "Custom Consent Options",
              "name": "options",
              "type": "list",
              "depends_on": "./enabled",
              "fields": [
                {
                  "name": "key",
                  "type": "text",
                },
                {
                  "name": "message",
                  "type": "rich_text"
                },
                {
                  "name": "initially_checked",
                  "type": "checkbox",
                  "default_value": false,
                },
                {
                  "name": "required",
                  "type": "checkbox",
                  "default_value": false
                }
              ]
            }
          ]
        },
        {
          "name": "require_email_verification",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "disable_third_party",
          "label": "Disable third party login providers",
          "type": "checkbox",
          "default_value": false
        }
      ]
    },
    {
      "label": "Terms and Conditions",
      "name": "terms",
      "type": "rich_text"
    },
    {
      "label": "Terms Document",
      "name": "terms_document",
      "type": "subsection",
      "hint": "If specified, a link to this terms document will be present on the login screen",
      "fields": [
        {
          "name": "link_text",
          "type": "text",
          "hint": "Default: 'Terms and Conditions'"
        },
        {
          "name": "terms_document",
          "type": "file",
          "extensions": ["html", "pdf"]
        }
      ]
    },
    {
      "name": "banners",
      "label": "Marketplace Banners",
      "type": "list",
      "hint": "If specified, these banner images will be shown at the top of the store page",
      "fields": [
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file",
        },
        {
          "extensions": imageTypes,
          "name": "image_mobile",
          "label": "Image (Mobile)",
          "type": "file",
        },
        {
          "name": "video",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "video_muted",
          "type": "checkbox",
          "default_value": true,
          "depends_on": "./video",
        },
        {
          "name": "modal_video",
          "type": "fabric_link",
          "hint": "If specified, this will be displayed in a modal when the banner is clicked",
          "video_preview": true,
          "depends_on": "./image"
        },
        {
          "name": "link",
          "type": "text",
          "hint": "If specified, the banner will link to this URL"
        },
        {
          "name": "sku",
          "label": "SKU",
          "type": "text",
          "hint": "If specified, the banner will link to the specified item"
        }
      ]
    },
    {
      "name": "footer_links",
      "type": "list",
      "hint": "Specify links to include in the footer of the marketplace, such as privacy or terms policies. Each item can either be specified as a URL, image, rich text, or an HTML document. The three latter options will be shown in a modal when clicked.",
      "fields": [
        {
          "name": "text",
          "type": "text"
        },
        {
          "name": "url",
          "label": "URL Link",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file",
        },
        {
          "name": "image_alt_text",
          "type": "text",
          "depends_on": "./image",
        },
        {
          "label": "Content (Rich Text)",
          "name": "content_rich_text",
          "type": "rich_text"
        },
        {
          "label": "Content (HTML)",
          "name": "content_html",
          "type": "file",
          "extensions": ["html"]
        }
      ]
    },
    {
      "name": "footer_text",
      "type": "rich_text"
    },

    {
      "label": "Payment, Currency and Localization Options",
      "name": "header_payment",
      "type": "header"
    },
    {
      "name": "localizations",
      "type": "multiselect",
      "options": Object.keys(languageOptions).map(key => [languageOptions[key], key])
    },
    {
      "name": "display_currencies",
      "type": "multiselect",
      "options": currencyOptions
    },
    {
      "name": "default_display_currency",
      "type": "reference_select",
      "reference": "./display_currencies",
      "depends_on": "./display_currencies"
    },
    {
      "name": "payment_options",
      "type": "subsection",
      "no_localize": true,
      "fields": [
        {
          "name": "stripe",
          "type": "subsection",
          "fields": [
            {
              "name": "enabled",
              "type": "checkbox",
              "default_value": true
            }
          ]
        },
        {
          "name": "ebanx",
          "type": "subsection",
          "fields": [
            {
              "name": "enabled",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "preferred",
              "type": "checkbox",
              "default_value": false,
              "depends_on": "./enabled"
            },
            {
              "name": "allowed_countries",
              "type": "multiselect",
              "options": ebanxSupportedCountries
            },
            {
              "name": "pix_enabled",
              "type": "checkbox",
              "default_value": false
            }
          ]
        },
        {
          "name": "coinbase",
          "type": "subsection",
          "fields": [
            {
              "name": "enabled",
              "type": "checkbox",
              "default_value": true
            }
          ]
        },
        {
          "name": "circle",
          "type": "subsection",
          "fields": [
            {
              "name": "enabled",
              "type": "checkbox",
              "default_value": false
            }
          ]
        }
      ]
    },


    {
      "label": "Item Definitions",
      "name": "header_items",
      "type": "header"
    },
    {
      "name": "items",
      "type": "list",
      "fields": [
        {
          "label": "SKU",
          "name": "sku",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "type",
          "type": "select",
          "options": [
            "nft",
            "ticket",
            "other"
          ],
          "no_localize": true
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "subtitle",
          "type": "text"
        },
        {
          "label": "Subtitle 2",
          "name": "subtitle2",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "label": "Description (Rich Text)",
          "name": "description_rich_text",
          "type": "rich_text",
          "hint": "NOTE: This will only be used in the featured item and item details view. The description field (above) will be used in the card list view"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file",
          "hint": "For type 'nft', the image from the NFT template will be used if this field is not specified"
        },
        {
          "name": "video",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video for this NFT will play on the purchase page in the store."
        },
        {
          "name": "video_has_audio",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "play_on_storefront",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, the video for this item will be played on the storefront page. Note: It is not recommended to have many items with videos visible on the storefront, as it may cause performance issues."
        },
        {
          "name": "for_sale",
          "type": "checkbox",
          "default_value": true,
          "no_localize": true
        },
        {
          "name": "viewable",
          "type": "checkbox",
          "default_value": false,
          "unless": "./for_sale",
          "hint": "Allows navigating to the item detail page from the storefront if 'For Sale' is unchecked",
          "no_localize": true
        },
        {
          "name": "allow_gift_purchase",
          "type": "checkbox",
          "hint": "If checked, this item may be purchased as a gift for another user. IMPORTANT NOTE: If an item is purchasable as gift, it *must not* have a trading hold period"
        },
        {
          "name": "gift_sku",
          "label": "Gift SKU",
          "type": "text",
          "depends_on": "./allow_gift_purchase",
          "hint": "When this item is purchased as a gift, this item will be purchased instead. NOTE: Presentation, gift options and price will be based on the settings of the gift item, not this item"
        },
        {
          "name": "use_custom_gift_presentation",
          "type": "checkbox",
          "depends_on": "./allow_gift_purchase",
          "unless": "./gift_sku",
          "hint": "Override the presentation of the item when it is a gift"
        },
        {
          "name": "gift_presentation",
          "type": "subsection",
          "depends_on": "./use_custom_gift_presentation",
          "unless": "./gift_sku",
          "fields": [
            {
              "name": "open_on_claim",
              "hint": "If specified, the receiving user will be presented with the gift item visual, and must click to 'open' the gift. Otherwise, the item will be minted directly to the user upon claim with no action required.",
              "type": "checkbox"
            },
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "subtitle",
              "type": "text"
            },
            {
              "label": "Subtitle 2",
              "name": "subtitle2",
              "type": "text"
            },
            {
              "name": "description",
              "type": "textarea"
            },
            {
              "label": "Description (Rich Text)",
              "name": "description_rich_text",
              "type": "rich_text",
              "hint": "NOTE: This will only be used in the featured item and item details view. The description field (above) will be used in the card list view"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file",
              "hint": "For type 'nft', the image from the NFT template will be used if this field is not specified"
            },
            {
              "name": "video",
              "type": "fabric_link",
              "video_preview": true,
              "hint": "If specified, this video for this NFT will play on the purchase page in the store."
            },
            {
              "name": "video_has_audio",
              "type": "checkbox",
              "default_value": false
            },
          ]
        },
        {
          "label": "Release Date",
          "name": "available_at",
          "type": "datetime",
          "hint": "(Optional) - If specified, this item will not be available for purchase until the specified time",
          "no_localize": true
        },
        {
          "label": "End Date",
          "name": "expires_at",
          "type": "datetime",
          "hint": "(Optional) - If specified, this item will no longer be available for purchase after the specified time. Note: The item will still show in the storefront, if specified, but will not be accessible.",
          "no_localize": true
        },
        {
          "name": "show_if_unreleased",
          "type": "checkbox",
          "default": false,
          "hint": "If checked, this item will be shown even if it has not yet released or if sale has ended.",
          "no_localize": true
        },
        {
          "name": "viewable_if_unreleased",
          "type": "checkbox",
          "depends_on": "./show_if_unreleased",
          "default": false,
          "hint": "If checked, the link to this items details will be present even if it has not yet released or if sale has ended.",
          "no_localize": true
        },
        {
          "name": "requires_permissions",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, users must have special permissions to the NFT template in order to view and buy the NFT in the marketplace",
          "no_localize": true
        },
        {
          "name": "show_if_unauthorized",
          "type": "checkbox",
          "default": false,
          "hint": "If checked, this item will be shown even if permissions and the user doesn't have access.",
          "depends_on": "./requires_permissions",
          "no_localize": true
        },
        {
          "name": "permission_message",
          "type": "string",
          "hint": "If permissions are required but the user does not have permission to purchase, this message will be shown at the bottom of the item. Default: 'Private Offering'",
          "depends_on": "./requires_permissions"
        },
        {
          "name": "permission_description",
          "type": "textarea",
          "hint": "If permissions are required but the user does not have permission to purchase, this description will be shown on the item instead of the default description.",
          "depends_on": "./requires_permissions"
        },
        {
          "name": "max_per_checkout",
          "label": "Max Purchasable per Checkout",
          "type": "integer",
          "no_localize": true
        },
        {
          "name": "max_per_user",
          "label": "Max Purchasable per User",
          "type": "integer",
          "no_localize": true
        },
        {
          "name": "free",
          "type": "checkbox",
          "hint": "If checked, this NFT will be free to claim. WARNING: This option will override any price value set below",
          "default_value": false,
          "no_localize": true
        },
        {
          "name": "hide_available",
          "label": "Hide Number Available",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true
        },
        {
          "name": "price",
          "type": "subsection",
          "no_localize": true,
          "fields": [
            {
              "name": "USD",
              "type": "number"
            }
          ]
        },
        {
          "name": "min_secondary_price",
          "label": "Minimum Secondary Market Listing Price",
          "type": "subsection",
          "no_localize": true,
          "fields": [
            {
              "name": "USD",
              "type": "number"
            }
          ]
        },
        {
          "name": "tags",
          "type": "list"
        },
        {
          "label": "NFT Template",
          "name": "nft_template",
          "type": "fabric_link",
          "hint": "For type 'nft' only",
          "no_localize": true,
          "version": true,
          "video_preview": true
        },
        {
          "name": "use_analytics",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true
        },
        {
          "name": "page_view_analytics",
          "type": "subsection",
          "no_localize": true,
          "depends_on": "./use_analytics",
          "fields": [
            {
              "name": "google_conversion_label",
              "label": "Google Conversion Label",
              "type": "string"
            },
            {
              "name": "google_conversion_id",
              "label": "Google Conversion ID",
              "type": "string"
            },
            {
              "name": "facebook_event_id",
              "label": "Facebook Event ID",
              "type": "string"
            },
            {
              "name": "twitter_event_id",
              "label": "Twitter Event ID",
              "type": "string"
            }
          ]
        },
        {
          "name": "purchase_analytics",
          "type": "subsection",
          "no_localize": true,
          "depends_on": "./use_analytics",
          "fields": [
            {
              "name": "google_conversion_label",
              "label": "Google Conversion Label",
              "type": "string"
            },
            {
              "name": "google_conversion_id",
              "label": "Google Conversion ID",
              "type": "string"
            },
            {
              "name": "facebook_event_id",
              "label": "Facebook Event ID",
              "type": "string"
            },
            {
              "name": "twitter_event_id",
              "label": "Twitter Event ID",
              "type": "string"
            }
          ]
        }
      ]
    },


    {
      "label": "Storefront Organization",
      "name": "header_storefront",
      "type": "header"
    },

    {
      "name": "storefront",
      "type": "subsection",
      "fields": [
        {
          "name": "header",
          "type": "text"
        },
        {
          "name": "subheader",
          "type": "text"
        },
        {
          "label": "Storefront Background",
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "Storefront Background (Mobile)",
          "name": "background_mobile",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "hide_text",
          "label": "Hide Default Text During Animation",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, the default text displayed while awaiting minting will be hidden and the purchase animation will be larger"
        },
        {
          "name": "show_rich_text_descriptions",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, the full rich text description of the item will be shown on the card face"
        },
        {
          "name": "show_card_cta",
          "label": "Show Item Card CTA",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, a CTA (button) will be shown on item cards on the storefront"
        },
        {
          "name": "skip_reveal",
          "type": "checkbox",
          "default_value": true,
          "hint": "If specified, the page will navigate directly to the first item purchased/claimed after minting has finished"
        },
        {
          "name": "purchase_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play on the status screen after a purchase is made until minting is complete"
        },
        {
          "name": "purchase_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "reveal_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play after minting has finished and before displaying results"
        },
        {
          "name": "reveal_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "gift_options",
          "type": "subsection",
          "fields": [
            {
              "name": "custom_redemption_settings",
              "label": "Custom Gift Redemption Settings",
              "type": "checkbox",
              "default_value": false,
              "hint": "Unless specified, the same options for item purchases will be used upon gift redemption"
            },
            {
              "name": "skip_reveal",
              "type": "checkbox",
              "default_value": true,
              "depends_on": "./custom_redemption_settings",
              "hint": "If specified, the page will navigate directly to the first item purchased/claimed after minting has finished"
            },
            {
              "name": "redeem_animation",
              "type": "fabric_link",
              "video_preview": true,
              "depends_on": "./custom_redemption_settings",
              "hint": "If specified, this video will play on the status screen after a gift is redeemed until minting is complete"
            },
            {
              "name": "redeem_animation_mobile",
              "type": "fabric_link",
              "video_preview": true,
              "depends_on": "./custom_redemption_settings",
            },
            {
              "name": "reveal_animation",
              "type": "fabric_link",
              "video_preview": true,
              "depends_on": "./custom_redemption_settings",
              "hint": "If specified, this video will play after minting has finished and before displaying results"
            },
            {
              "name": "reveal_animation_mobile",
              "type": "fabric_link",
              "video_preview": true,
              "depends_on": "./custom_redemption_settings",
            },
          ]
        },
        {
          "name": "sections",
          "type": "list",
          "fields": [
            {
              "name": "section_header",
              "type": "text"
            },
            {
              "name": "section_subheader",
              "type": "text"
            },
            {
              "name": "section_header_rich_text",
              "label": "Section Header (Rich Text)",
              "type": "rich_text"
            },
            {
              "name": "section_footer",
              "type": "rich_text"
            },
            {
              "name": "show_countdown",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "countdown",
              "type": "subsection",
              "depends_on": "./show_countdown",
              "fields": [
                {
                  "name": "header",
                  "type": "text"
                },
                {
                  "name": "date",
                  "type": "datetime"
                }
              ]
            },
            {
              "name": "type",
              "type": "select",
              "no_localize": true,
              "options": [
                "Standard",
                "Featured"
              ]
            },
            {
              "name": "featured_view_justification",
              "type": "select",
              "depends_on": "./type",
              "depends_on_value": "Featured",
              "no_localize": true,
              "options": [
                "Left",
                "Right",
                "Center"
              ]
            },
            {
              "name": "show_carousel_gallery",
              "type": "checkbox",
              "hint": "If checked, selectable icons of items in the list will be displayed below the featured view. Will not be displayed when only one item is in the list",
              "depends_on": "./type",
              "depends_on_value": "Featured",
              "default_value": false,
              "no_localize": true,
            },
            {
              "name": "items",
              "type": "reference_multiselect",
              "reference": "/items",
              "label_key": "name",
              "value_key": "sku"
            }
          ]
        },
      ]
    },



    {
      "label": "Collections",
      "name": "header_collections",
      "type": "header"
    },

    {
      "name": "collections_info",
      "type": "subsection",
      "fields": [
        {
          "name": "header",
          "type": "text",
          "hint": "Default: 'Collections'"
        },
        {
          "name": "subheader",
          "type": "textarea"
        },
        {
          "extensions": imageTypes,
          "name": "icon",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "banner",
          "type": "file"
        },
        {
          "name": "show_on_storefront",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "hide_text",
          "label": "Hide Default Text During Animation",
          "default_value": false,
          "hint": "If specified, the default text displayed while awaiting minting will be hidden and the purchase animation will be larger"
        },
        {
          "name": "redeem_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play on the status screen after a collection is redeemed until minting is complete. This can be overridden for individual collections."
        },
        {
          "name": "redeem_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "reveal_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play after minting has finished and before displaying results. This can be overridden for individual collections."
        },
        {
          "name": "reveal_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        }
      ]
    },
    {
      "name": "collections",
      "type": "list",
      "no_localize": true,
      "fields": [
        {
          "label": "SKU",
          "name": "sku",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "collection_header",
          "type": "text"
        },
        {
          "name": "collection_subheader",
          "type": "textarea"
        },
        {
          "extensions": imageTypes,
          "name": "collection_icon",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "collection_banner",
          "type": "file"
        },
        {
          "name": "items",
          "type": "reference_multiselect",
          "reference": "/items",
          "label_key": "name",
          "value_key": "sku",
          "allow_null": true
        },
        {
          "name": "redeemable",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "redeem_items",
          "type": "reference_multiselect",
          "reference": "/items",
          "label_key": "name",
          "value_key": "sku",
          "allow_null": true
        },
        {
          "name": "hide_text",
          "label": "Hide Default Text During Animation",
          "default_value": false,
          "hint": "If specified, the default text displayed while awaiting minting will be hidden and the purchase animation will be larger"
        },
        {
          "name": "redeem_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play on the status screen after a collection is redeemed until minting is complete. This will override the animation selected in Collections Info above."
        },
        {
          "name": "redeem_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "name": "reveal_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play after minting has finished and before displaying results. This will override the animation selected in Collections Info above."
        },
        {
          "name": "reveal_animation_mobile",
          "type": "fabric_link",
          "video_preview": true
        }
      ]
    },


    {
      "label": "Voting Events",
      "name": "header_voting",
      "type": "header"
    },
    {
      "name": "voting_events",
      "type": "list",
      "fields": [
        {
          "label": "ID",
          "name": "id",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "rich_text"
        },
        {
          "name": "exclusive",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true
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
          "name": "type",
          "type": "select",
          "no_localize": true,
          "default_value": "specified",
          "options": [
            ["Specified Items", "specified"],
            ["All Items", "all"]
          ]
        },
        {
          "label": "Votable Items",
          "name": "items",
          "type": "reference_multiselect",
          "reference": "/items",
          "label_key": "name",
          "value_key": "sku",
          "depends_on": "./type",
          "depends_on_value": "specified",
          "no_localize": true
        }
      ]
    },

    {
      "label": "Analytics",
      "name": "header_analytics",
      "type": "header"
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
                "Facebook Pixel ID",
                "App Nexus Segment ID",
                "App Nexus Pixel ID",
                "Twitter Pixel ID"
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
      "name": "storefront_page_view_analytics",
      "type": "subsection",
      "no_localize": true,
      "fields": [
        {
          "name": "google_conversion_label",
          "label": "Google Conversion Label",
          "type": "string"
        },
        {
          "name": "google_conversion_id",
          "label": "Google Conversion ID",
          "type": "string"
        },
        {
          "name": "facebook_event_id",
          "label": "Facebook Event ID",
          "type": "string"
        },
        {
          "name": "twitter_event_id",
          "label": "Twitter Event ID",
          "type": "string"
        }
      ]
    },
  ]
};

export default MarketplaceSpec;
