const MediaLibrarySpec = {
  "profile": {
    "name": "Eluvio Media Library",
    "version": "0.1",
  },
  "manage_app": "default",
  "hide_image_tab": true,
  "associate_permissions": true,
  "associated_assets": [],
  "title_types": ["media_library"],
  "asset_types": ["primary"],
  "controls": [],
  "default_image_keys": [],
  "info_fields": [
    {
      "name": "playlists",
      "type": "list",
      "buttonText": "Add Playlist",
      "fields": [
        {
          "name": "id",
          "label": "Playlist ID",
          "type": "uuid"
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
          "name": "content",
          "type": "list",
          "fields": [
            {
              "name": "id",
              "label": "Content ID",
              "type": "uuid"
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

export default MediaLibrarySpec;
