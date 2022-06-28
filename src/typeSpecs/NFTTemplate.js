const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const NFTTemplateSpec = {
  "profile": {
    "name": "NFT Template",
    "version": "0.3",
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
          "name": "hide_additional_media_player_controls",
          "type": "checkbox",
          "hint": "If checked, the player controls below additional media on the NFT details page will be hidden for this NFT",
          "default_value": false
        },
        {
          "name": "additional_media",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "subtitle_1",
              "type": "text",
              "hint": "Artist, for example"
            },
            {
              "name": "subtitle_2",
              "type": "text",
              "hint": "Album, for example"
            },
            {
              "name": "description",
              "type": "rich_text"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file_url",
              "hint": "Square image recommended"
            },
            {
              "name": "default",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "requires_permissions",
              "type": "checkbox",
              "default_value": false
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
              "name": "media_link",
              "type": "fabric_link",
              "hint": "For video content, select the playable content object",
              "video_preview": true,
              "depends_on": "./media_type",
              "depends_on_value": ["Video", "Audio"]
            },
            {
              "name": "media_file",
              "type": "file",
              "hint": "If this media is displayed via file, like an image, Ebook or HTML, select the file to display",
              "depends_on": "./media_type",
              "depends_on_value": ["Image", "Ebook", "HTML"]
            },
            {
              "name": "parameters",
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
                      "hint": "Integer percentage from 0 to 100",
                      "default_value": 100
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default NFTTemplateSpec;
