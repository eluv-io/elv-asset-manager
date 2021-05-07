const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const EmbeddedCollectionSpec = {
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "collection"
  ],
  "associated_assets": [
    {
      "defaultable": false,
      "for_title_types": [],
      "indexed": false,
      "label": "",
      "name": "items",
      "orderable": true,
      "slugged": false,
      "title_types": []
    }
  ],
  "info_fields": [
    {
      "name": "header",
      "type": "text"
    },
    {
      "name": "description",
      "type": "textarea"
    },
    {
      "fields": [
        {
          "extensions": imageTypes,
          "name": "logo",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "hero_image",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Hero Image (Mobile)",
          "name": "hero_image_mobile",
          "type": "file"
        }
      ],
      "name": "images",
      "type": "subsection"
    }
  ]
};

export default EmbeddedCollectionSpec;
