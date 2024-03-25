const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const eventTenantSpec = {
  "profile": {
    name: "Eluvio LIVE Tenant",
    version: "0.3",
  },
  "hide_image_tab": true,
  manageApp: "default",
  controls: [
    "images",
  ],
  asset_types: [
    "primary",
  ],
  title_types: [
    "site-selector"
  ],
  info_fields: [
    {
      "name": "name",
      "type": "text"
    },
    {
      "hint": "The tenant ID in \"iten***\" format",
      "label": "Tenant ID",
      "name": "tenant_id",
      "type": "text"
    },
    {
      "name": "branding",
      "label": "Wallet Branding",
      "type": "subsection",
      "hint": "These options will be used for participating marketplaces in this tenant instead of the marketplace's settings on non-marketplace pages, such as listings and within the user's profile.",
      "fields": [
        {
          "label": "App Background",
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "App Background (Mobile)",
          "name": "background_mobile",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "wallet_css",
          "label": "Wallet CSS",
          "type": "textarea"
        }
      ]
    },
    {
      "fields": [
        {
          "fields": [],
          "label": "Owner Addresses",
          "name": "owners",
          "type": "list"
        },
        {
          "fields": [],
          "label": "Authorized Entitlement Signers",
          "name": "authorized_entitlement_signers",
          "type": "list"
        },
        {
          "fields": [],
          "label": "Leaderboard Excluded Addresses",
          "name": "leaderboard_excludes",
          "type": "list"
        },
        {
          "hint": "Wallet or contract address for receiving store revenue",
          "label": "Sales Revenue Address",
          "name": "revenue_addr",
          "type": "text"
        },
        {
          "hint": "Wallet or contract address for receiving royalties revenue",
          "label": "Royalty Revenue Address",
          "name": "royalty_addr",
          "type": "text"
        },
        {
          "hint": "Default royalty percentage for NFT transactions",
          "label": "Royalty",
          "name": "royalty",
          "type": "integer"
        },
        {
          "hint": "Optional minimum listing price for secondary sales",
          "label": "Minimum Listing Price",
          "name": "min_list_price",
          "type": "number"
        }
      ],
      "hint": "Tenant-level settings for fungible/non-fungible tokens",
      "label": "Token Settings",
      "name": "token",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "hint": "A short, unique ID used to namespace custodial wallet keys.  If this ID changes, all private keys assigned to users previously will change!",
          "label": "Issuer ID",
          "name": "issuer_id",
          "type": "text"
        },
        {
          "hint": "The exact issuer URL.  This URL may change as long as the issuer unique ID remains unchanged.",
          "label": "Issuer URL",
          "name": "issuer_url",
          "type": "text"
        }
      ],
      "hint": "Specify a custom OpenID provider for use with the Eluvio Custodial Wallet",
      "label": "Custom OpenID",
      "name": "open_id",
      "type": "subsection"
    }
  ],
  localizations: [],
  associated_assets: [
    {
      name: "sites",
      label: "Events",
      indexed: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["site"]
    },
    {
      name: "marketplaces",
      index: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["marketplace"]
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

export default eventTenantSpec;
