import NFTMedia from "./NFTMedia";
const languageOptions = require("./LanguageCodes").default;
const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const NFTTemplateSpec = {
  "profile": {
    "name": "NFT Template",
    "version": "0.4",
  },
  localization: {
    localizations: Object.keys(languageOptions)
  },
  "playable": true,
  "display_app": "default",
  "manage_app": "default",
  "hide_image_tab": true,
  "associate_permissions": false,
  "associated_assets": [],
  "controls": [],
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "nft_template"
  ],
  "default_image_keys": [],
  "info_fields": [
    {
      "name": "permission",
      "type": "metadata_link",
      "default_value": "/permissioned",
      "readonly": true,
      "no_localize": true
    },
    {
      "name": "mint_private",
      "label": "Minting Info (Private)",
      "type": "subsection",
      "path": "/permissioned",
      "no_localize": true,
      "fields": [
        {
          "name": "address",
          "type": "text",
          "readonly": true
        }
      ]
    },
    {
      "name": "mint",
      "label": "Minting Info",
      "type": "subsection",
      "top_level": true,
      "no_localize": true,
      "fields": [
        {
          "name": "merge_meta",
          "label": "Merge Metadata",
          "type": "json"
        },
        {
          "name": "token_template",
          "label": "Token ID Template",
          "type": "text"
        },
        {
          "name": "cauth_id",
          "label": "Mint Key ID",
          "type": "text"
        },
        {
          "name": "fauth_id",
          "label": "Fabric Key ID",
          "type": "text"
        },
        {
          "name": "use_mint_ordinal_in_token_id",
          "label": "Use Mint Ordinal in Token ID",
          "type": "checkbox",
          "hint": "Generate numeric token IDs: #1, #2, #3, ... (initial mint order may be randomized)",
          "default_value": true
        },
        {
          "name": "shuffle_token_id",
          "label": "Shuffle Token ID",
          "type": "checkbox",
          "hint": "When using ordinal token IDs, randomize the initial mint order",
          "default_value": true
        },
        {
          "name": "token_template",
          "label": "Token ID Template",
          "type": "text",
          "hint": "Create vanity token IDs based on this template (only valid if not using ordinal token IDs)"
        },

      ]
    },
    {
      "name": "nft",
      "label": "NFT Details",
      "type": "subsection",
      "top_level": true,
      "fields": [
        {
          "name": "template_id",
          "label": "Template ID",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "test",
          "label": "Test Mode",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, this NFT will not be listable for sale",
          "no_localize": true
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "display_name",
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
          "label": "Additional Info",
          "name": "rich_text",
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
              "default_value": "Terms and Conditions"
            },
            {
              "name": "terms_document",
              "type": "file",
              "extensions": ["html", "pdf"]
            }
          ]
        },
        {
          "name": "media_type",
          "type": "select",
          "options": [
            "Video",
            "Audio",
            "Image",
            "Ebook",
            "HTML"
          ]
        },
        {
          "name": "media",
          "label": "Media File",
          "type": "file",
          "hint": "If this media is displayed via file, like an image, Ebook or HTML, select the file to display",
          "depends_on": "./media_type",
          "depends_on_value": ["Image", "Ebook", "HTML"]
        },
        {
          "name": "media_parameters",
          "type": "list",
          "depends_on": "./media_type",
          "depends_on_value": "HTML",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "value",
              "type": "text"
            }
          ]
        },
        {
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text",
          "no_localize": true,
          "hint": "Address of the NFT contract associated with this NFT template (read-only - set by the NFT build)",
          "readonly": true
        },
        {
          "name": "total_supply",
          "type": "integer",
          "no_localize": true,
          "hint": "Maximum number of tokens that can be generated for this NFT contract (read-only - this number is read from the contract)",
          "readonly": true
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "creator",
          "type": "text"
        },
        {
          "name": "copyright",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "datetime",
          "no_localize": true
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file_url",
          "hint": "Square image recommended"
        },
        {
          "extensions": imageTypes,
          "name": "background_image",
          "type": "file"
        },
        {
          "name": "playable",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "has_audio",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "generative",
          "type": "checkbox",
          "default_value": false,
          "no_localize": true
        },
        {
          "name": "id_format",
          "label": "ID Format",
          "type": "select",
          "default_value": "token_id",
          "no_localize": true,
          "options": [
            "token_id",
            "token_id/cap",
            "ordinal/cap",
            "ordinal"
          ]
        },
        {
          "name": "token_uri",
          "label": "Token URI",
          "type": "self_metadata_url",
          "path": "public/asset_metadata/nft",
          "no_localize": true
        },
        {
          "name": "embed_url",
          "label": "Embed URL",
          "type": "self_embed_url",
          "no_localize": true,
          "version": true,
          "auto_update": true,
          // Player options
          "loop": true,
          "hide_controls": true,
          "muted": true,
          "autoplay": true,
          "check_has_audio_flag": true
        },
        {
          "name": "external_url",
          "label": "External URL",
          "type": "self_embed_url",
          "no_localize": true,
          "version": true,
          "auto_update": true,
          // Player options
          "loop": true,
          "hide_controls": true,
          "muted": true,
          "autoplay": true,
          "check_has_audio_flag": true
        },

        {
          "name": "style",
          "label": "Style Variant",
          "type": "text",
          "hint": "If specified, this will be added to the HTML container class when this NFT is displayed (e.g. 'card-container--variant-(style)', 'featured-item__icon-container--variant-(style)' 'feature-gallery__icon-container--variant-(style)')"
        },
        {
          "name": "enable_watermark",
          "type": "checkbox",
          "no_localize": true
        },
        {
          "name": "test",
          "label": "Test NFT",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, this NFT will be marked as a test NFT",
          "no_localize": true
        },
        {
          "name": "redeemable_offers",
          "type": "list",
          "fields": [
            {
              "label": "Offer ID",
              "name": "offer_id",
              "type": "text",
              "hint": "This ID refers to the contract and is set by the offer creation script",
              "readonly": true,
              "no_localize": true
            },
            {
              "name": "name",
              "type": "text",
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file",
              "hint": "Square image recommended"
            },
            {
              "name": "animation",
              "type": "fabric_link",
              "hint": "Shows in place of the image when viewing the offer",
              "video_preview": true
            },
            {
              "name": "redeem_animation",
              "type": "fabric_link",
              "hint": "Shows while waiting for the redemption process to complete",
              "video_preview": true
            },
            {
              "name": "redeem_animation_loop",
              "label": "Loop Redeem Animation",
              "type": "checkbox",
              "default_value": true,
              "depends_on": "./redeem_animation"
            },
            {
              "name": "require_redeem_animation",
              "type": "checkbox",
              "default_value": true,
              "hint": "If specified, the redeem animation will play through at least once before showing results",
              "depends_on": "./redeem_animation"
            },
            {
              "name": "description",
              "type": "rich_text"
            },
            {
              "label": "Release Date",
              "name": "available_at",
              "type": "datetime",
              "hint": "(Optional) - If specified, this offer will not be redeemable until the specified time",
              "no_localize": true
            },
            {
              "label": "End Date",
              "name": "expires_at",
              "type": "datetime",
              "hint": "(Optional) - If specified, this item will no longer be redeemable after the specified time.",
              "no_localize": true
            },
            {
              "name": "style",
              "label": "Style Variant",
              "type": "text",
              "hint": "If specified, this will be added to the HTML container class when this offer is displayed (e.g. 'redeemable-offer--variant-(style)'"
            },
            {
              "name": "visibility",
              "type": "subsection",
              "no_localize": true,
              "fields": [
                {
                  "name": "featured",
                  "type": "checkbox",
                  "default_value": false,
                  "hint": "If checked, this offer will be shown in the featured media tab"
                },
                {
                  "label": "Hidden",
                  "name": "hide",
                  "type": "checkbox",
                  "default_value": false,
                  "hint": "If checked, this offer will not be shown"
                },
                {
                  "name": "hide_if_unreleased",
                  "type": "checkbox",
                  "unless": "./hide",
                  "hint": "If checked, this offer will be hidden until the release date",
                  "default_value": false
                },
                {
                  "name": "hide_if_expired",
                  "type": "checkbox",
                  "unless": "./hide",
                  "hint": "If checked, this offer will be hidden after the expiration date",
                  "default_value": false
                }
              ]
            }
          ]
        },
        {
          "name": "marketplace_attributes",
          "type": "subsection",
          "no_localize": true,
          "fields": [
            {
              "name": "opensea",
              "label": "OpenSea",
              "type": "subsection",
              "fields": [
                {
                  "name": "youtube_url",
                  "type": "self_embed_url",
                  "version": true,
                  "auto_update": true,
                  // Player options
                  "loop": true,
                  "hide_controls": true,
                  "muted": true,
                  "autoplay": true,
                  "check_has_audio_flag": true
                }
              ]
            },
            {
              "name": "Eluvio",
              "type": "subsection",
              "fields": [
                {
                  "name": "marketplace_id",
                  "label": "Marketplace ID",
                  "type": "text"
                },
                {
                  "name": "sku",
                  "label": "SKU",
                  "type": "text"
                }
              ]
            }
          ]
        },
        {
          "name": "attributes",
          "label": "Custom Attributes",
          "no_localize": true,
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "type",
              "type": "select",
              "default_value": "text",
              "options": [
                "checkbox",
                "color",
                "datetime",
                "fabric_link",
                "file",
                "file_url",
                "integer",
                "json",
                "number",
                "text",
                "textarea",
                "uuid"
              ]
            },
            {
              "name": "value",
              "type": "reference_type",
              "reference": "./type"
            }
          ]
        },
        {
          "name": "pack_options",
          "type": "subsection",
          "fields": [
            {
              "name": "is_openable",
              "type": "checkbox",
              "no_localize": true
            },
            {
              "name": "pack_generator",
              "type": "select",
              "default_value": "random",
              "options": [
                "random",
                "preset"
              ],
              "no_localize": true,
              "hint": "Choose the way pack content will be generated.  Use 'preset' if content supply is limited to the number of packs and distribution needs to be precise."
            },
            {
              "name": "open_button_text",
              "type": "text",
              "default_value": "Open Pack"
            },
            {
              "name": "hide_text",
              "label": "Hide Default Text",
              "type": "checkbox",
              "default_value": false,
              "hint": "If specified, the default text displayed while opening the pack will be hidden and the open animation will be larger"
            },
            {
              "name": "use_custom_open_text",
              "type": "checkbox",
              "default_value": false,
              "hint": "If specified, you can configure the text that is displayed while opening the pack",
              "unless": "./hide_text"
            },
            {
              "name": "minting_text",
              "type": "subsection",
              "unless": "./hide_text",
              "depends_on": "./use_custom_open_text",
              "fields": [
                {
                  "name": "minting_header",
                  "type": "text",
                  "default_value": "Your pack is opening"
                },
                {
                  "name": "minting_subheader1",
                  "type": "text",
                  "default_value": "This may take several minutes"
                },
                {
                  "name": "minting_subheader2",
                  "type": "text",
                  "default_value": "You can navigate away from this page if you don't want to wait. Your items will be available in your wallet when the process is complete."
                },
                {
                  "name": "reveal_header",
                  "type": "text",
                  "default_value": "Congratulations!"
                },
                {
                  "name": "reveal_subheader",
                  "type": "text",
                  "default_value": "You've received the following items:"
                }
              ]
            },
            {
              "name": "open_animation",
              "type": "fabric_link",
              "hint": "Looping video that will play while pack is opening",
              "video_preview": true
            },
            {
              "name": "open_animation_mobile",
              "label": "Open Animation (Mobile)",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "reveal_animation",
              "type": "fabric_link",
              "hint": "Video that will play after pack has opened and before displaying results",
              "video_preview": true
            },
            {
              "name": "reveal_animation_mobile",
              "label": "Reveal Animation (Mobile)",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "item_slots",
              "type": "list",
              "no_localize": true,
              "fields": [
                {
                  "name": "possible_items",
                  "type": "list",
                  "fields": [
                    {
                      "name": "nft",
                      "label": "NFT Template or Collection",
                      "type": "fabric_link"
                    },
                    {
                      "name": "probability",
                      "type": "integer",
                      "default_value": 0
                    }
                  ]
                }
              ]
            }
          ]
        },
        ...NFTMedia,
      ]
    }
  ]
};

export default NFTTemplateSpec;
