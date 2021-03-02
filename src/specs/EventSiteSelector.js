const eventSiteSelectorSpec = {
  name: "Event Site Selector",
  version: "0.1",
  controls: [
    "images",
  ],
  availableAssetTypes: [
    "primary",
  ],
  availableTitleTypes: [
    "site-selector"
  ],
  infoFields: [],
  localizations: [],
  fileControls: [],
  fileControlItems: {},
  associatedAssets: [
    {
      name: "sites",
      label: "Sites",
      indexed: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["site"]
    }
  ]
};

export default eventSiteSelectorSpec;
