const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const eventSiteSpec = {
  name: "Event Site",
  version: "0.1",
  controls: [],
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
          "name": "event_header",
          "type": "text"
        },
        {
          "name": "event_subheader",
          "type": "text"
        },
        {
          "name": "event_title",
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
          "extensions": imageTypes,
          "name": "hero_background",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "header",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "poster",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_background",
          "type": "file",
          "label": "Main Background (TV)"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_logo",
          "type": "file",
          "label": "Main Logo (TV)"
        }
      ],
      "name": "event_images",
      "type": "subsection"
    },
    {
      "fields": [
        /*
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

         */
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
          "name": "name",
          "type": "text"
        },
        /*
        {
          "name": "footer_text",
          "type": "text"
        },
        {
          "name": "stream_text",
          "type": "text"
        },

         */
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
      "name": "payment_currencies",
      "type": "multiselect",
      "hint": "List of accepted currencies for tickets and merchandise",
      "default_value": ["USD"],
      "options": [
        "USD",
        "GBP",
        "EUR",
        "JPY",

        "AED",
        "AFA",
        "ALL",
        "AMD",
        "ANG",
        "AOR",
        "ARS",
        "AUD",
        "AWG",
        "AZN",
        "BBD",
        "BDT",
        "BGN",
        "BHD",
        "BIF",
        "BMD",
        "BND",
        "BOB",
        "BRL",
        "BSD",
        "BTN",
        "BWP",
        "BYN",
        "BZD",
        "CAD",
        "CDF",
        "CHF",
        "CLP",
        "CNY",
        "COP",
        "CRC",
        "CUP",
        "CVE",
        "CZK",
        "DJF",
        "DKK",
        "DOP",
        "DZD",
        "EEK",
        "EGP",
        "ERN",
        "ETB",
        "EUR",
        "FJD",
        "FKP",
        "GBP",
        "GEL",
        "GHS",
        "GIP",
        "GMD",
        "GNF",
        "GTQ",
        "GYD",
        "HKD",
        "HNL",
        "HRK",
        "HTG",
        "HUF",
        "IDR",
        "ILS",
        "INR",
        "IQD",
        "IRR",
        "ISK",
        "JMD",
        "JOD",
        "JPY",
        "KES",
        "KGS",
        "KHR",
        "KMF",
        "KPW",
        "KRW",
        "KWD",
        "KYD",
        "KZT",
        "LAK",
        "LBP",
        "LKR",
        "LRD",
        "LSL",
        "LTL",
        "LVL",
        "LYD",
        "MAD",
        "MDL",
        "MGA",
        "MKD",
        "MMK",
        "MNT",
        "MOP",
        "MRO",
        "MUR",
        "MVR",
        "MWK",
        "MXN",
        "MYR",
        "MZN",
        "NAD",
        "NGN",
        "NIO",
        "NOK",
        "NPR",
        "NZD",
        "OMR",
        "PAB",
        "PEN",
        "PGK",
        "PHP",
        "PKR",
        "PLN",
        "PYG",
        "QAR",
        "RON",
        "RSD",
        "RUB",
        "RWF",
        "SAR",
        "SBD",
        "SCR",
        "SDG",
        "SEK",
        "SGD",
        "SHP",
        "SLL",
        "SOS",
        "SRD",
        "STD",
        "SVC",
        "SYP",
        "SZL",
        "THB",
        "TJS",
        "TMT",
        "TND",
        "TOP",
        "TRY",
        "TTD",
        "TWD",
        "TZS",
        "UAH",
        "UGX",
        "USD",
        "UYU",
        "UZS",
        "VEF",
        "VND",
        "VUV",
        "WST",
        "XAF",
        "XAG",
        "XAU",
        "XCD",
        "XDR",
        "XFO",
        "XFU",
        "XOF",
        "XPD",
        "XPF",
        "XPT",
        "YER",
        "ZAR",
        "ZMK",
        "ZWL"
      ]
    },
    {
      "fields": [
        {
          "name": "stripe_public_key",
          "type": "text"
        },
        {
          "label": "PayPal Client ID",
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
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "label": "NTP ID",
              "name": "otp_id",
              "type": "text"
            },
            {
              "name": "start_time",
              "type": "datetime"
            },
            {
              "name": "price",
              "type": "reference_subsection",
              "reference": "payment_currencies",
              "value_type": "number",
              "hint": "Available price currencies are based on the 'Payment Currencies' field above",
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
          "name": "description",
          "type": "textarea"
        },
        {
          "label": "NTP ID",
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
              "name": "price",
              "type": "reference_subsection",
              "reference": "payment_currencies",
              "value_type": "number",
              "hint": "Available price currencies are based on the 'Payment Currencies' field above",
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
