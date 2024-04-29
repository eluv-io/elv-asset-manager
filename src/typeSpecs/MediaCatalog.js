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
      "name": "warning",
      "type": "text",
      "default_value": "Please use the Eluvio Creator Studio to edit this object",
      "readonly": true
    }
  ]
};

export default MediaCatalogSpec;
