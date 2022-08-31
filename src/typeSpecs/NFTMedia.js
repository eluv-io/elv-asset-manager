const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

// For the additional_media section of NFTTemplate
const NFTMediaItem = [
  {
    "label": "ID",
    "name": "id",
    "type": "uuid"
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
      "Gallery",
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
    "options": [
      "List",
      "Sections"
    ]
  },
  {
    "name": "additional_media",
    "type": "list",
    "depends_on": "./additional_media_type",
    "depends_on_value": "List",
    "fields": NFTMediaItem
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
        "fields": NFTMediaItem
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
            "type": "uuid"
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
                "type": "uuid"
              },
              {
                "name": "media",
                "type": "list",
                "fields": NFTMediaItem
              }
            ]
          }
        ]
      }
    ]
  }
];


export default NFTMedia;