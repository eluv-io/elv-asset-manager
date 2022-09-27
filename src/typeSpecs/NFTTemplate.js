import NFTMedia from "./NFTMedia";

const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const NFTTemplateSpec = {
  "profile": {
    "name": "NFT Template",
    "version": "0.4",
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
      "readonly": true
    },
    {
      "name": "mint_private",
      "label": "Minting Info (Private)",
      "type": "subsection",
      "path": "/permissioned",
      "fields": [
        {
          "name": "address",
          "type": "text"
        }
      ]
    },
    {
      "name": "mint",
      "label": "Minting Info",
      "type": "subsection",
      "top_level": true,
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
          "default_value": true
        },
        {
          "name": "shuffle_token_id",
          "label": "Shuffle Token ID",
          "type": "checkbox",
          "default_value": true
        }
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
          "type": "uuid"
        },
        {
          "name": "test",
          "label": "Test Mode",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, this NFT will not be listable for sale"
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
          "name": "rich_text",
          "type": "rich_text"
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
          "type": "text"
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "total_supply",
          "type": "integer"
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
          "type": "datetime"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file_url",
          "hint": "Square image recommended"
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
          "default_value": false
        },
        {
          "name": "id_format",
          "label": "ID Format",
          "type": "select",
          "default_value": "token_id",
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
          "path": "public/asset_metadata/nft"
        },
        {
          "name": "embed_url",
          "label": "Embed URL",
          "type": "self_embed_url",
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
        },
        {
          "name": "test",
          "label": "Test NFT",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, this NFT will be marked as a test NFT"
        },
        {
          "name": "redeemable_offers",
          "type": "list",
          "fields": [
            {
              "label": "Offer ID",
              "name": "offer_id",
              "type": "text",
              "readonly": true
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
              "name": "description",
              "type": "rich_text"
            },
            {
              "label": "Release Date",
              "name": "available_at",
              "type": "datetime",
              "hint": "(Optional) - If specified, this offer will not be redeemable until the specified time"
            },
            {
              "label": "End Date",
              "name": "expires_at",
              "type": "datetime",
              "hint": "(Optional) - If specified, this item will no longer be redeemable after the specified time."
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
              "fields": [
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
              "type": "checkbox"
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
