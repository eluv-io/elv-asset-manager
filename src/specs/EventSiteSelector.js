const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

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
  infoFields: [
    {
      "name": "name",
      "type": "text"
    },
    {
      "extensions": imageTypes,
      "name": "logo",
      "type": "file"
    },
    {
      "name": "copyright",
      "type": "text"
    },
    {
      "name": "privacy_policy",
      "type": "rich_text"
    },
    {
      "label": "Privacy Policy (HTML)",
      "name": "privacy_policy_html",
      "type": "file",
      "extensions": ["html"]
    },
    {
      "label": "Terms and Conditions",
      "name": "terms",
      "type": "rich_text"
    },
    {
      "label": "Terms and Conditions (HTML)",
      "name": "terms_html",
      "type": "file",
      "extensions": ["html"]
    }
  ],
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
    },
    {
      name: "collections",
      label: "Collections",
      indexed: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["collection"]
    }
  ]
};

export default eventSiteSelectorSpec;
