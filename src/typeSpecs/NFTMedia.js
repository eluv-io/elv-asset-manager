const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

// For the additional_media section of NFTTemplate
const NFTMediaItem = [
  {
    "label": "ID",
    "name": "id",
    "type": "uuid",
    "no_localize": true,
  },
  {
    "name": "name",
    "type": "text"
  },
  {
    "name": "subtitle_1",
    "type": "text",
  },
  {
    "name": "subtitle_2",
    "type": "text",
  },
  {
    "name": "key",
    "type": "text",
    "hint": "Additional key for identifying this media item. Not used in UI",
    "no_localize": true,
  },
  {
    "name": "description",
    "type": "rich_text"
  },
  {
    "extensions": imageTypes,
    "name": "image",
    "type": "file_url"
  },
  {
    "name": "image_aspect_ratio",
    "type": "select",
    "options": [
      "Square",
      "Wide",
      "Tall"
    ],
    "unless": "./container",
    "unless_value": "featured"
  },
  {
    "name": "tags",
    "type": "list",
    "fields": [
      {
        "name": "key",
        "type": "text"
      },
      {
        "name": "value",
        "type": "text"
      }
    ]
  },
  {
    "name": "requires_permissions",
    "type": "checkbox",
    "default_value": false,
    "no_localize": true,
  },
  {
    "name": "media_type",
    "type": "select",
    "no_localize": true,
    "options": [
      "Video",
      "Live Video",
      "Audio",
      "Image",
      "Gallery",
      "Ebook",
      "HTML",
      "Link",
      "Embedded Webpage",
      "Media Reference"
    ]
  },
  {
    "name": "start_time",
    "type": "datetime",
    "no_localize": true,
    "depends_on": "./media_type",
    "depends_on_value": "Live Video"
  },
  {
    "name": "end_time",
    "type": "datetime",
    "no_localize": true,
    "depends_on": "./media_type",
    "depends_on_value": "Live Video"
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
    "name": "link",
    "type": "text",
    "depends_on": "./media_type",
    "depends_on_value": ["Link", "Embedded Webpage"]
  },
  {
    "name": "authorized_link",
    "type": "checkbox",
    "hint": "If checked, will add the user's fabric auth token to the link specified above",
    "default_value": false,
    "depends_on": "./media_type",
    "depends_on_value": ["Link"]
  },
  {
    "name": "media_reference",
    "type": "subsection",
    "depends_on": "./media_type",
    "depends_on_value": ["Media Reference"],
    "fields": [
      {
        "name": "section_id",
        "label": "Section ID",
        "type": "text"
      },
      {
        "name": "collection_id",
        "label": "Collection ID",
        "type": "text"
      }
    ]
  },
  {
    "name": "offerings",
    "type": "list",
    "hint": "Specify, in order of preference, which offerings should be used when playing this media. If the offering is default or only one offering will be available, specifying the offering is not necessary",
    "depends_on": "./media_type",
    "depends_on_value": ["Video", "Audio"]
  },
  {
    "name": "background_image",
    "type": "file",
    "extensions": imageTypes,
    "depends_on": "./media_type",
    "depends_on_value": "Gallery"
  },
  {
    "label": "Background Image (Mobile)",
    "name": "background_image_mobile",
    "type": "file",
    "extensions": imageTypes,
    "depends_on": "./media_type",
    "depends_on_value": "Gallery"
  },
  {
    "name": "controls",
    "type": "select",
    "options": [
      "Carousel",
      "Arrows"
    ],
    "default_value": "Carousel",
    "depends_on": "./media_type",
    "depends_on_value": "Gallery",
    "no_localize": true,
  },
  {
    "name": "gallery",
    "type": "list",
    "depends_on": "./media_type",
    "depends_on_value": "Gallery",
    "buttonText": "Add Item",
    "fields": [
      {
        "name": "name",
        "type": "text"
      },
      {
        "name": "key",
        "type": "text",
        "hint": "Additional key for identifying this media item. Not used in UI",
        "no_localize": true,
      },
      {
        "name": "description",
        "type": "textarea"
      },
      {
        "extensions": imageTypes,
        "name": "image",
        "type": "file",
      },
      {
        "name": "image_aspect_ratio",
        "type": "select",
        "options": [
          "Square",
          "Wide",
          "Tall"
        ]
      },
      {
        "name": "video",
        "type": "fabric_link",
        "video_preview": true
      }
    ]
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
];

const NFTMedia = [
  {
    "name": "additional_media_type",
    "type": "select",
    "hint": "Specify how you want to organize additional media for this NFT - either a simple list of items, or a number of organized sections",
    "default_value": "List",
    "no_localize": true,
    "options": [
      "List",
      "Sections"
    ]
  },
  {
    "name": "additional_media_display",
    "type": "select",
    "default_value": "Media",
    "depends_on": "./additional_media_type",
    "depends_on_value": "List",
    "no_localize": true,
    "options": [
      "Media",
      "Album"
    ]
  },
  {
    "name": "show_autoplay",
    "type": "checkbox",
    "default_value": false,
    "depends_on": "./additional_media_display",
    "depends_on_value": "Media",
    "unless": "./additional_media_type",
    "unless_value": "Sections",
    "no_localize": true
  },
  {
    "name": "additional_media",
    "type": "list",
    "depends_on": "./additional_media_type",
    "depends_on_value": "List",
    "fields": [
      {
        "name": "container",
        "type": "hidden",
        "hidden": true,
        "default_value": "list"
      },
      ...NFTMediaItem
    ]
  },
  {
    "label": "Custom Gallery CSS",
    "name": "additional_media_custom_css",
    "type": "textarea",
    "hint": "Used for gallery display",
    "no_localize": true,
  },
  {
    "name": "additional_media_sections",
    "type": "subsection",
    "depends_on": "./additional_media_type",
    "depends_on_value": "Sections",
    "fields": [
      {
        "name": "featured_media",
        "type": "list",
        "fields": [
          {
            "name": "container",
            "type": "hidden",
            "hidden": true,
            "default_value": "featured"
          },
          {
            "name": "required",
            "type": "checkbox",
            "hint": "If checked, all other additional media will be locked until this item is displayed",
            "no_localize": true,
          },
          ...NFTMediaItem,
          {
            "name": "animation",
            "type": "fabric_link",
            "video_preview": true
          },
          {
            "name": "button_text",
            "type": "text"
          },
          {
            "name": "button_image",
            "type": "file",
            "extensions": imageTypes
          },
          {
            "name": "poster_image",
            "type": "file",
            "extensions": imageTypes
          },
          {
            "name": "background_image",
            "type": "file",
            "extensions": imageTypes
          },
          {
            "name": "background_image_tv",
            "label": "Background Image (TV)",
            "type": "file",
            "extensions": imageTypes
          },
          {
            "name": "background_image_logo_tv",
            "type": "file",
            "extensions": imageTypes
          },
          {
            "name": "locked_state",
            "type": "subsection",
            "hint": "These fields will be used when the item has not yet been viewed",
            "depends_on": "./required",
            "fields": [
              {
                "name": "name",
                "type": "text"
              },
              {
                "name": "subtitle_1",
                "type": "text",
              },
              {
                "name": "subtitle_2",
                "type": "text",
              },
              {
                "name": "description",
                "type": "rich_text"
              },
              {
                "name": "button_text",
                "type": "text"
              },
              {
                "name": "button_image",
                "type": "file",
                "extensions": imageTypes
              },
              {
                "extensions": imageTypes,
                "name": "image",
                "type": "file_url"
              },
              {
                "name": "animation",
                "type": "fabric_link",
                "video_preview": true
              },
              {
                "name": "background_image",
                "type": "file",
                "extensions": imageTypes
              },
            ]
          }
        ]
      },
      {
        "label": "Media Sections",
        "name": "sections",
        "type": "list",
        "fields": [
          {
            "name": "name",
            "type": "text"
          },
          {
            "label": "ID",
            "name": "id",
            "type": "uuid",
            "no_localize": true,
          },
          {
            "name": "collections",
            "type": "list",
            "fields": [
              {
                "name": "name",
                "type": "text"
              },
              {
                "label": "ID",
                "name": "id",
                "type": "uuid",
                "no_localize": true,
              },
              {
                "name": "display",
                "type": "select",
                "default_value": "Media",
                "no_localize": true,
                "options": [
                  "Media",
                  "Album"
                ]
              },
              {
                "name": "show_autoplay",
                "type": "checkbox",
                "default_value": false,
                "depends_on": "./display",
                "depends_on_value": "Media",
                "no_localize": true
              },
              {
                "name": "media",
                "type": "list",
                "fields": [
                  {
                    "name": "container",
                    "type": "hidden",
                    "hidden": true,
                    "default_value": "collection"
                  },
                  ...NFTMediaItem,
                  {
                    "name": "locked",
                    "type": "checkbox",
                    "default_value": false,
                    "no_localize": true,
                  },
                  {
                    "name": "locked_state",
                    "type": "subsection",
                    "hint": "These fields will be used when the item is locked",
                    "depends_on": "./locked",
                    "fields": [
                      {
                        "name": "lock_condition",
                        "type": "select",
                        "no_localize": true,
                        "options": [
                          "View Media"
                        ]
                      },
                      {
                        "label": "Required Media IDs",
                        "name": "required_media",
                        "type": "list",
                        "depends_on": "./lock_condition",
                        "depends_on_value": "View Media",
                        "no_localize": true,
                      },
                      {
                        "name": "name",
                        "type": "text"
                      },
                      {
                        "name": "subtitle_1",
                        "type": "text",
                      },
                      {
                        "name": "subtitle_2",
                        "type": "text",
                      },
                      {
                        "name": "description",
                        "type": "rich_text"
                      },
                      {
                        "extensions": imageTypes,
                        "name": "image",
                        "type": "file_url"
                      },
                      {
                        "name": "image_aspect_ratio",
                        "type": "select",
                        "options": [
                          "Square",
                          "Wide",
                          "Tall"
                        ]
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
  }
];


export default NFTMedia;
