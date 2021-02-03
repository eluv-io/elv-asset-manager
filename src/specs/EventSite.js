const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const eventSiteSpec = {
  controls: [
    "images"
  ],
  availableAssetTypes: [
    "primary"
  ],
  availableTitleTypes: [
    "site"
  ],
  defaultImageKeys: [],
  localizations: [],
  fileControls: [],
  fileControlItems: {},
  associatedAssets: [
    {
      name: "promos",
      label: "Promos",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
    {
      name: "streams",
      label: "Streams",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
  ],
  infoFields: [
    {
      "label": "Tenant ID",
      "name": "tenant_id",
      "type": "text"
    },
    {
      "label": "Base URL Slug",
      "name": "base_slug",
      "type": "text",
      "hint": "Base URL Slug for this site (e.g. https://live.eluv.io/<base_slug>/<site>) (Optional)"
    },
    {
      "fields": [
        {
          "name": "artist",
          "type": "text"
        },
        {
          "name": "event_title",
          "type": "text"
        },
        {
          "name": "event_header",
          "type": "text"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "name": "date",
          "type": "datetime"
        },
        {
          "name": "description",
          "type": "textarea"
        }
      ],
      "name": "event_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "intro",
          "type": "textarea"
        },
        {
          "fields": [
            {
              "name": "full_name",
              "type": "text"
            },
            {
              "name": "age",
              "type": "text"
            },
            {
              "name": "gender",
              "type": "text"
            },
            {
              "name": "birth_date",
              "type": "text"
            },
            {
              "name": "birth_place",
              "type": "text"
            },
            {
              "name": "nationality",
              "type": "text"
            },
            {
              "name": "trivia",
              "type": "textarea"
            }
          ],
          "name": "bio",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "name": "youtube",
              "type": "text"
            },
            {
              "name": "instagram",
              "type": "text"
            },
            {
              "name": "twitter",
              "type": "text"
            },
            {
              "name": "website",
              "type": "text"
            },
            {
              "name": "facebook",
              "type": "text"
            },
            {
              "name": "soundcloud",
              "type": "text"
            },
            {
              "name": "apple_music",
              "type": "text"
            },
            {
              "name": "spotify",
              "type": "text"
            }
          ],
          "name": "social_media_links",
          "type": "subsection"
        }
      ],
      "name": "artist_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "extensions": imageTypes,
          "name": "hero_background",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "poster",
          "type": "file"
        }
      ],
      "name": "event_images",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "footer_text",
          "type": "text"
        },
        {
          "name": "stream_text",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        }
      ],
      "name": "sponsors",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "subheader",
          "type": "text"
        },
        {
          "name": "header",
          "type": "text"
        }
      ],
      "name": "stream_page",
      "type": "subsection"
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
          "name": "location",
          "type": "text"
        },
        {
          "label": "Start Time",
          "name": "start_time",
          "type": "datetime"
        },
        {
          "label": "End Time",
          "name": "end_time",
          "type": "datetime"
        }
      ],
      "label": "Calendar Event",
      "name": "calendar",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "stripe_public_key",
          "type": "text"
        },
        {
          "name": "paypal_client_id",
          "type": "text"
        }
      ],
      "label": "Payment Service Configurations",
      "name": "payment_config",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
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
          "fields": [],
          "name": "tags",
          "type": "list"
        },
        {
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "label": "OTP ID",
              "name": "otp_id",
              "type": "text"
            },
            {
              "name": "start_time",
              "type": "datetime"
            },
            {
              "fields": [
                {
                  "name": "amount",
                  "type": "number"
                },
                {
                  "name": "currency",
                  "options": [
                    "USD",
                    "CNY",
                    "EUR",
                    "GBP",
                    "JPY"
                  ],
                  "type": "select"
                }
              ],
              "name": "price",
              "type": "subsection"
            },
            {
              "fields": [
                {
                  "fields": [
                    {
                      "label": "Price ID",
                      "name": "price_id",
                      "type": "text"
                    },
                    {
                      "label": "Product ID",
                      "name": "product_id",
                      "type": "text"
                    },
                    {
                      "label": "SKU ID",
                      "name": "sku_id",
                      "type": "text"
                    }
                  ],
                  "name": "stripe",
                  "type": "subsection"
                }
              ],
              "label": "Payment IDs",
              "name": "payment_ids",
              "type": "subsection"
            }
          ],
          "label": "SKUs",
          "name": "skus",
          "type": "list"
        }
      ],
      "name": "tickets",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "type",
          "options": [
            "merchandise",
            "donation"
          ],
          "type": "select"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "heading",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "label": "OTP ID",
          "name": "otp_id",
          "type": "text"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            }
          ],
          "name": "images",
          "type": "list"
        },
        {
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "fields": [
                {
                  "name": "amount",
                  "type": "number"
                },
                {
                  "name": "currency",
                  "options": [
                    "USD",
                    "CNY",
                    "EUR",
                    "GBP",
                    "JPY"
                  ],
                  "type": "select"
                }
              ],
              "name": "price",
              "type": "subsection"
            },
            {
              "fields": [
                {
                  "fields": [
                    {
                      "label": "Price ID",
                      "name": "price_id",
                      "type": "text"
                    },
                    {
                      "label": "Product ID",
                      "name": "product_id",
                      "type": "text"
                    },
                    {
                      "label": "SKU ID",
                      "name": "sku_id",
                      "type": "text"
                    }
                  ],
                  "name": "stripe",
                  "type": "subsection"
                }
              ],
              "label": "Payment IDs",
              "name": "payment_ids",
              "type": "subsection"
            }
          ],
          "label": "SKUs",
          "name": "skus",
          "type": "list"
        }
      ],
      "name": "products",
      "type": "list"
    }
  ]
};

export default eventSiteSpec;
