const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const eventSiteExtrasSpec = {
  name: "Event Site",
  version: "0.11",
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "extra"
  ],
  "associate_permissions": false,
  "associated_assets": [],
  "controls": [],
  "default_image_keys": [],
  "info_fields": [
    {
      "name": "release_date",
      "type": "datetime"
    },
    {
      "name": "synopsis",
      "type": "textarea"
    },
    {
      "name": "copyright",
      "type": "text"
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
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "name": "video",
          "type": "fabric_link"
        }
      ],
      "name": "Gallery",
      "type": "list"
    }
  ]
};

export default eventSiteExtrasSpec;
