const defaultSpec = {
  "profile": {
    name: "Default",
    version: "0.1",
  },
  manageApp: "default",
  controls: [
    "images",
    "playlists"
  ],
  asset_types: [
    "primary",
    "clip"
  ],
  title_types: [
    "collection",
    "episode",
    "season",
    "series",
    "site",
    "title"
  ],
  default_image_keys: [
    "portrait",
    "landscape"
  ],
  info_fields: [
    {name: "release_date", type: "date"},
    {name: "synopsis", type: "textarea"},
    {name: "copyright"},
    {name: "creator"},
    {name: "runtime", type: "integer"},
  ],
  localizations: [],
  associated_assets: [
    {
      name: "titles",
      label: "Titles",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
    {
      name: "series",
      label: "Series",
      asset_types: ["primary"],
      title_types: ["series"],
      for_title_types: ["site", "collection"],
      indexed: true,
      slugged: true,
      defaultable: false,
      orderable: true
    },
    {
      name: "seasons",
      label: "Seasons",
      asset_types: ["primary"],
      title_types: ["season"],
      for_title_types: ["series"],
      indexed: true,
      slugged: true,
      defaultable: false,
      orderable: true
    },
    {
      name: "episodes",
      label: "Episodes",
      asset_types: ["primary"],
      title_types: ["episode"],
      for_title_types: ["season"],
      indexed: true,
      slugged: true,
      defaultable: false,
      orderable: true
    }
  ]
};

export default defaultSpec;
