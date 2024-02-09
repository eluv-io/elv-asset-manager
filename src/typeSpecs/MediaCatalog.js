const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const MediaCatalogSpec = {
  "profile": {
    "name": "Eluvio Media Catalog",
    "version": "0.1",
  },
  "manage_app": "default",
  "hide_image_tab": true,
  "associate_permissions": false,
  "associated_assets": [],
  "title_types": ["media_catalog"],
  "asset_types": ["primary"],
  "controls": [],
  "default_image_keys": [],
  "info_fields": [
    {
      "name": "collections",
      "label": "Media Collections",
      "type": "list",
      "buttonText": "Add Collection",
      "fields": [
        {
          "name": "id",
          "label": "Collection ID",
          "type": "uuid"
        },
        {
          "name": "type",
          "type": "select",
          "default_value": "collection",
          "options": [
            ["Media Collection", "collection"],
            ["Sequential Playlist", "playlist"]
          ]
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "content",
          "type": "list",
          "fields": [
            {
              "name": "id",
              "label": "Content ID",
              "type": "uuid"
            },
            {
              "name": "title",
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
              "hint": "Square image recommended"
            },
            {
              "name": "headers",
              "label": "Content Info",
              "type": "list",
              "hint": "(optional) A list of text fields to display with the content info, such as year released, content rating, etc."
            },
            {
              "name": "media",
              "type": "fabric_link",
              "video_preview": true
            }
          ]
        }
      ]
    }
  ]
};

export default MediaCatalogSpec;
