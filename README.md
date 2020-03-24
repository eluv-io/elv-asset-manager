![Eluvio Logo](src/static/images/Logo-Small.png "Eluvio Logo")
  
# Eluvio Asset Manager

This application is designed to assist in the management of site objects in the fabric browser. By assigning the app (using the dist/index.html file) as the management app for a content type, all content objects of that type will be editable in the fabric browser using this app.

The asset manager app allows editing of well-defined fields in the content object metadata of the asset, as well as setting up links to other content from the asset. These info fields as well as the name and structure of the links are configurable via the content type metadata using a simple schema. 

As an example of a possible use-case, the asset may represent a season of a series. The asset manager app can be configured to present a form containing a number of relevant fields such as title, synopsis, season number, etc., a list of episodes in the form of links to other assets, a list of clips or trailers for the season, images and image galleries associated with the season, etc. The season may then itself be linked within a 'series' asset containing a list of all the seasons, and so on.

## App Configuration via Content Type Metadata

The forms the asset manager app presents can be specified in the metadata of the content type to which the app is attached. These options go in the `public/title_configuration` section of the type metadata. 

Here is a full example of asset configuration metadata for a content type:

```json
{
  "public":{
    "title_configuration":{
      "controls":[
        "credits",
        "playlists",
        "gallery",
        "live_stream",
        "channel"
      ],
      "asset_types":[
        "primary",
        "secondary"
      ],
      "title_types":[
        "site",
        "series",
        "season",
        "title"
      ],
      "info_fields":[
        {
          "name":"synopsis",
          "type":"textarea"
        },
        {
          "name":"copyright"
        },
        {
          "name":"runtime",
          "type":"integer",
          "label":"Run Time"
        },
        {
          "name":"scripted",
          "type":"checkbox",
          "for_title_types":[
            "episode",
            "season",
            "series"
          ]
        }
      ],
      "default_image_keys":[
        "portrait",
        "landscape",
        "thumbnail"
      ],
      "associated_assets":[
        {
          "name":"seasons",
          "label":"Seasons",
          "asset_types":[
            "primary"
          ],
          "title_types":[
            "season"
          ],
          "for_title_types":[
            "series"
          ],
          "indexed":true,
          "slugged":true,
          "defaultable":false,
          "orderable":true
        }
      ]
    }
  }
}

```

### Asset and Title Types

The available values for `asset_type` and `title_type` presented in the form are configurable using the `asset_types` and `title_types` fields, which are both simple lists of strings:

```json
  "asset_types": [
    "primary",
    "secondary"
  ],
  "title_types": [
    "site",
    "story",
    "chapter"
  ]
```


### Asset Info

Configuring `info_fields` in the content type allows for configuration of the form corresponding to info about the asset. This info will be saved in the asset under `public/asset_metadata/info`.

The schema for this configuring fields is an array of the following:

- `name` (required) - The metadata key of the field
- `label` - By default, the label for each field shown in the form is `name` with each word (delimited by space or underscore) capitalized. For example, `display_title` becomes `Display Title`. If this is not ideal, `label` can be specified to explicitly define the label in the form.
- `type` - Possible values: `textarea`|`integer`|`number`|`checkbox` - If not specified, field is presented as a single line text input
- `top_level` - If specified, the field will be saved in `public/asset_metadata` instead of `public/asset_metadata/info`
- `for_title_types` - If the field should only be presented for certain title types, those types can be specified as an array.

Example: 

```json
  "info_fields": [
    {"name": "synopsis", "type": "textarea", "top_level": true},
    {"name": "copyright"},
    {"name": "mpaa_rating", "label": "MPAA Rating"},
    {"name": "mpaa_rating_reason", "label": "MPAA Rating Reason"},
    {"name": "runtime", "type": "integer"},
    {"name": "scripted", "type": "checkbox", "for_title_types": ["episode", "season", "series"]},
    {"name": "tv_rating", "label": "TV Rating"},
    {"name": "tv_rating_reason", "label": "TV Rating Reason"}
  ]
```

### Associated Assets

The `associated_assets` field is used for defining other assets that can be linked to within the asset.

- `name` (required) - The metadata key of the asset type
- `label` - The label for the asset type
- `asset_types` - If specified, limits the assets that can be selected for this asset type based on `asset_type`
- `title_types` - If specified, limits the assets that can be selected for this asset type based on `title_type`
- `for_title_types` - If the asset type should only be presented for certain title types, those types can be specified as an array.
- `indexed` - The assets will be saved in the metadata with a ordered index `({"0": [asset], "1": [asset]})`
- `slugged` - The assets will be saved in the metadata with the asset's slug `({"asset-01": [asset], "asset-02": [asset]})`
- `defaultable` - If specified, one asset can be specified as the 'default' (not applicable for `indexed=false + slugged=false`)
- `orderable` - If specified, the order of the assets can be changed in the form (not applicable for `indexed=false + slugged=true`)

See [this example](#associated-asset-example) for details about how the asset lists are saved in metadata based on the `indexed`, `slugged` and `defaultable` options.

Example: 

```json
  "associated_assets": [
    {
      "name": "seasons",
      "label": "Seasons",
      "asset_types": ["primary"],
      "title_types": ["season"],
      "for_title_types": ["series"],
      "indexed": true,
      "slugged": true,
      "defaultable": false,
      "orderable": true
    },
    {
      "name": "titles",
      "label": "Titles",
      "asset_types": ["primary"],
      "title_types": ["episode", "feature", "season", "series"],
      "indexed": true,
      "slugged": true,
      "defaultable": false,
      "orderable": true
    },
    {
      "name": "trailers",
      "label": "Trailers",
      "asset_types": ["trailer", "clip"],
      "indexed": true,
      "slugged": false,
      "defaultable": true,
      "orderable": true
    }
  ]
```

### Image Keys

The `default_image_keys` field is used for defining commonly used image types for an asset. For example, if you have a video asset type where each asset should have a portrait oriented and landscape oriented image, as well as a thumbnail,
you could specify these fields like so:

```json
  "default_image_keys": [
    "portrait",
    "landscape",
    "thumbnail"
  ]
```

This specification would automatically populate the images tab of the asset editor form with `portrait`, `landscape` and `thumbnail` keys if not already present, so the user managing the asset knows to select those images.

<a name="associated-asset-example"></a>
### Detailed Associated Asset Type Metadata Example

The following contains example metadata with all 4 combinations of `indexed` and `slugged` for associated asset types.

```json
{
   "neither":[
      {
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__73VaqKfmZjqhbJ8hiJaNixHupWxZvccynYupXRcRscYm8YbEJgSc3CT6A9a5e9qVsjjyZHaEMR/meta/public/asset_metadata"
      },
      {
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__Gahn5WkdkzxMwhYF9mcYpLZ6kKLjTYFR86ARugsD3NRrmfRdVo7nGLTGB6FmrRHjexSPfYecsm/meta/public/asset_metadata"
      },
      {
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__3zTrUiXS47fR7fWfXyShLsqunxvjaK13TBbcB9cVLETG3iZeM4hZszNWSo9iMLaDi3E6jVLmuh/meta/public/asset_metadata"
      }
   ],
   "indexed":{
      "0":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__73VaqKfmZjqhbJ8hiJaNixHupWxZvccynYupXRcRscYm8YbEJgSc3CT6A9a5e9qVsjjyZHaEMR/meta/public/asset_metadata"
      },
      "1":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__Gahn5WkdkzxMwhYF9mcYpLZ6kKLjTYFR86ARugsD3NRrmfRdVo7nGLTGB6FmrRHjexSPfYecsm/meta/public/asset_metadata"
      },
      "default":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__3zTrUiXS47fR7fWfXyShLsqunxvjaK13TBbcB9cVLETG3iZeM4hZszNWSo9iMLaDi3E6jVLmuh/meta/public/asset_metadata"
      }
   },
   "slugged":{
      "clip":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__73VaqKfmZjqhbJ8hiJaNixHupWxZvccynYupXRcRscYm8YbEJgSc3CT6A9a5e9qVsjjyZHaEMR/meta/public/asset_metadata"
      },
      "episode-title":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__Gahn5WkdkzxMwhYF9mcYpLZ6kKLjTYFR86ARugsD3NRrmfRdVo7nGLTGB6FmrRHjexSPfYecsm/meta/public/asset_metadata"
      },
     "feature-title":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"/qfab/hq__3zTrUiXS47fR7fWfXyShLsqunxvjaK13TBbcB9cVLETG3iZeM4hZszNWSo9iMLaDi3E6jVLmuh/meta/public/asset_metadata"
      },
      "default":{
         ".":{
            "auto_update":{
               "tag":"latest"
            }
         },
         "/":"./meta/public/asset_metadata/slugged/feature-title"
      }
   },
   "both":{
      "0":{
         "clip":{
            ".":{
               "auto_update":{
                  "tag":"latest"
               }
            },
            "/":"/qfab/hq__73VaqKfmZjqhbJ8hiJaNixHupWxZvccynYupXRcRscYm8YbEJgSc3CT6A9a5e9qVsjjyZHaEMR/meta/public/asset_metadata"
         }
      },
      "1":{
         "episode-title":{
            ".":{
               "auto_update":{
                  "tag":"latest"
               }
            },
            "/":"/qfab/hq__Gahn5WkdkzxMwhYF9mcYpLZ6kKLjTYFR86ARugsD3NRrmfRdVo7nGLTGB6FmrRHjexSPfYecsm/meta/public/asset_metadata"
         }
      },
      "default":{
         "feature-title":{
            ".":{
               "auto_update":{
                  "tag":"latest"
               }
            },
            "/":"/qfab/hq__3zTrUiXS47fR7fWfXyShLsqunxvjaK13TBbcB9cVLETG3iZeM4hZszNWSo9iMLaDi3E6jVLmuh/meta/public/asset_metadata"
         }
      }
   }
}
```
