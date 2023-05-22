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
      "extensions": imageTypes,
      "name": "logo",
      "type": "file"
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
      "name": "openid",
      "type": "subsection"
    },
    {
      "label": "Token Settings",
      "name": "header_token_settings",
      "type": "header"
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
      "label": "Tenant Properties",
      "name": "header_properties",
      "type": "header"
    },
    {
      "name": "properties",
      "type": "list",
      "fields": [
        {
          "name": "id",
          "label": "ID",
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
          "name": "image",
          "extensions": imageTypes,
          "type": "file"
        },
        {
          "name": "background_image",
          "extensions": imageTypes,
          "type": "file"
        },
        {
          "name": "background_image_mobile",
          "label": "Background Image (Mobile)",
          "extensions": imageTypes,
          "type": "file"
        },
        {
          "name": "projects",
          "type": "list",
          "fields": [
            {
              "name": "id",
              "label": "ID",
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
              "name": "image",
              "extensions": imageTypes,
              "type": "file"
            },
            {
              "name": "background_image",
              "extensions": imageTypes,
              "type": "file"
            },
            {
              "name": "background_image_mobile",
              "label": "Background Image (Mobile)",
              "extensions": imageTypes,
              "type": "file"
            },
            {
              "name": "marketplace_slug",
              "type": "text"
            },
            {
              "name": "media_site",
              "type": "fabric_link"
            },
            {
              "name": "associated_items",
              "type": "list",
              "fields": [
                {
                  "name": "nft_address",
                  "label": "NFT Address",
                  "type": "text",
                  "required": true
                },
                {
                  "name": "item_sku",
                  "label": "Item SKU",
                  "type": "text"
                }
              ]
            }
          ]
        }
      ]
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
    }
  ]
};

export default eventTenantSpec;
