const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();


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
      "type": "text"
    },
    {
      "name": "tenant_slug",
      "type": "text",
      "required": true
    },
    {
      "name": "tenant_name",
      "type": "text",
      "required": true
    },
    {
      "label": "Preview Password",
      "name": "preview_password_digest",
      "type": "password",
      "hint": "Set a password to prevent viewing of unpublished changes by unauthorized users"
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
          "default_value": false
        },
        {
          "name": "external_link",
          "type": "text",
          "hint": "If specified, the icon for this marketplace in the global marketplace view will link to this URL"
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
          "name": "round_logo",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This logo will be displayed in the list of available marketplaces"
        },
        {
          "name": "card_banner",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This banner will be displayed in the list of available marketplaces. It should be roughly 16:10 aspect ratio."
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
          "name": "hide_global_navigation",
          "type": "checkbox",
          "default_value": false,
          "hint": "If specified, the global navigation to all listings and marketplaces will not be shown when this marketplace is embedded into your site"
        },
        {
          "label": "Hide Leaderboard",
          "name": "hide_leaderboard",
          "type": "checkbox",
          "default_value": false
        },
        {
          "label": "Hide Marketplace Name on Store Page",
          "name": "hide_name",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "tabs",
          "type": "subsection",
          "hint": "Specify different text to be used for links in the header",
          "fields": [
            {
              "name": "store",
              "type": "text",
              "default_value": "Store"
            },
            {
              "name": "listings",
              "type": "text",
              "default_value": "Listings"
            },
            {
              "name": "my_items",
              "type": "text",
              "default_value": "My Items"
            }
          ]
        },
        {
          "name": "tags",
          "type": "multiselect",
          "hint": "These tags will be used to help users discover your marketplace based on their interests.",
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
          "options": [
            "Left",
            "Center"
          ]
        },
        {
          "name": "item_text_justification",
          "type": "select",
          "default_value": "Left",
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
          "options": [
            "Light",
            "Dark",
            "Custom"
          ]
        },
        {
          "label": "Custom CSS",
          "name": "custom_css",
          "type": "textarea",
          "depends_on": "./color_scheme",
          "depends_on_value": "Custom",
          "hint": "The wallet application has a number of CSS variables that can be modified to easily change fonts, colors, borders, and other attributes. Click here to see the full list.",
          "hint_link": "https://github.com/eluv-io/elv-media-wallet/blob/custom-styling/src/static/stylesheets/themes/default.css",
          "default_value":
`:root {

}`
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
              "default_value": false
            },
            {
              "name": "consent_modal_header",
              "type": "textarea",
              "depends_on": "./enabled"
            },
            {
              "name": "button_text",
              "type": "text",
              "default_value": "I Accept",
              "depends_on": "./enabled"
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
      "label": "Terms and Conditions (HTML)",
      "name": "terms_html",
      "type": "file",
      "extensions": ["html"]
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
      "label": "Item Definitions",
      "name": "header_items",
      "type": "header"
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
          "label": "SKU",
          "name": "sku",
          "type": "uuid"
        },
        {
          "name": "type",
          "type": "select",
          "options": [
            "nft",
            "ticket",
            "other"
          ]
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
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
          "name": "play_on_storefront",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, the video for this item will be played on the storefront page. Note: It is not recommended to have many items with videos visible on the storefront, as it may cause performance issues."
        },
        {
          "name": "for_sale",
          "type": "checkbox",
          "default_value": true
        },
        {
          "label": "Release Date",
          "name": "available_at",
          "type": "datetime",
          "hint": "(Optional) - If specified, this item will not be available for purchase until the specified time"
        },
        {
          "label": "End Date",
          "name": "expires_at",
          "type": "datetime",
          "hint": "(Optional) - If specified, this item will no longer be available for purchase after the specified time. Note: The item will still show in the storefront, if specified, but will not be accessible."
        },
        {
          "name": "show_if_unreleased",
          "type": "checkbox",
          "default": false,
          "hint": "If checked, this item will be shown even if it has not yet released or if sale has ended."
        },
        {
          "name": "requires_permissions",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, users must have special permissions to the NFT template in order to view and buy the NFT in the marketplace"
        },
        {
          "name": "show_if_unauthorized",
          "type": "checkbox",
          "default": false,
          "hint": "If checked, this item will be shown even if permissions and the user doesn't have access.",
          "depends_on": "./requires_permissions"
        },
        {
          "name": "permission_message",
          "type": "string",
          "default_value": "Private Sale",
          "hint": "If permissions are required but the user does not have permission to purchase, this message will be shown at the bottom of the item.",
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
          "type": "integer"
        },
        {
          "name": "max_per_user",
          "label": "Max Purchasable per User",
          "type": "integer"
        },
        {
          "name": "free",
          "type": "checkbox",
          "hint": "If checked, this NFT will be free to claim. WARNING: This option will override any price value set below",
          "default_value": false
        },
        {
          "name": "hide_available",
          "label": "Hide Number Available",
          "type": "checkbox",
          "default_value": false
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
        }
      ],
      "name": "items",
      "type": "list"
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
          "name": "hide_text",
          "label": "Hide Default Text During Animation",
          "default_value": false,
          "hint": "If specified, the default text displayed while awaiting minting will be hidden and the purchase animation will be larger"
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
              "name": "type",
              "type": "select",
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
              "options": [
                "Left",
                "Right"
              ]
            },
            {
              "name": "show_carousel_gallery",
              "type": "checkbox",
              "hint": "If checked, selectable icons of items in the list will be displayed below the featured view. Will not be displayed when only one item is in the list",
              "depends_on": "./type",
              "depends_on_value": "Featured",
              "default_value": false
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
          "default_value": "Explore Collections"
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
    }
  ]
};

export default MarketplaceSpec;
