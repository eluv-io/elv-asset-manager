import React from "react";
import {inject, observer} from "mobx-react";
import {Input, TextArea, Selection, Date, MultiSelect} from "./Inputs";

const GENRES = [
  "Action / Adventure",
  "Action",
  "Adult",
  "Adventure",
  "Animation",
  "Awards Show",
  "Beauty Pageant",
  "Biblical",
  "Biography",
  "Black Exploitation (ORION)",
  "Business",
  "Childrens",
  "Classic",
  "Comedy",
  "Comedy / Drama",
  "Comedy / Adventure",
  "Comic Fantasy",
  "Coming of Age",
  "Competition",
  "Comedy / Romance",
  "Crime",
  "Dance",
  "Documentary",
  "DocuDrama",
  "Dramatic Comedy",
  "Drama",
  "Erotic",
  "Espionage",
  "Family",
  "Fantasy",
  "Game Show",
  "Historical",
  "Holiday",
  "Horror",
  "Instructional",
  "LGBTQ",
  "Live Event",
  "Magazine Format",
  "Magic Show",
  "Thriller",
  "Mystery",
  "Musical",
  "Noir",
  "Performance",
  "Reality",
  "Religious",
  "Romance",
  "Romantic Comedy",
  "Romantic Drama",
  "Sci-Fi/Adventure",
  "Sci-Fi",
  "Sci-Fi/Horror",
  "Sci-Fi/Thriller",
  "Sports",
  "Suspense",
  "War",
  "Western"
];

@inject("formStore")
@observer
class AssetInfo extends React.Component {
  // Generate list of inputs as defined in infoFields
  InfoFields() {
    return this.props.formStore.infoFields.map(({name, label, type}) => {
      if(type === "textarea") {
        return (
          <TextArea
            key={`input-${name}`}
            name={name}
            label={label}
            value={this.props.formStore.assetInfo[name]}
            onChange={value => this.props.formStore.UpdateAssetInfo(name, value)}
          />
        );
      } else {
        return (
          <Input
            key={`input-${name}`}
            name={name}
            label={label}
            type={type}
            value={this.props.formStore.assetInfo[name]}
            onChange={value => this.props.formStore.UpdateAssetInfo(name, value)}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="asset-form-section-container">
        <h3>Asset Info</h3>
        <div className="asset-info-container">
          <Selection
            name="title_type"
            value={this.props.formStore.assetInfo.title_type}
            onChange={title_type => this.props.formStore.UpdateAssetInfo("title_type", title_type)}
            options={["collection", "episode", "feature", "franchise", "season", "series", "site"]}
          />

          <Selection
            name="asset_type"
            value={this.props.formStore.assetInfo.asset_type}
            onChange={asset_type => this.props.formStore.UpdateAssetInfo("asset_type", asset_type)}
            options={["clip", "primary", "trailer"]}
          />

          <Input
            name="title"
            value={this.props.formStore.assetInfo.title}
            onChange={title => this.props.formStore.UpdateAssetInfo("title", title)}
          />

          <Input
            name="display_title"
            value={this.props.formStore.assetInfo.display_title}
            onChange={display_title => this.props.formStore.UpdateAssetInfo("display_title", display_title)}
          />

          <Input
            name="slug"
            value={this.props.formStore.assetInfo.slug}
            onChange={slug => this.props.formStore.UpdateAssetInfo("slug", slug)}
          />

          <Input
            name="ip_title_id"
            label="IP Title ID"
            value={this.props.formStore.assetInfo.ip_title_id}
            onChange={ip_title_id => this.props.formStore.UpdateAssetInfo("ip_title_id", ip_title_id)}
          />

          <Date
            name="release_date"
            year={this.props.formStore.assetInfo.release_date.year}
            month={this.props.formStore.assetInfo.release_date.month}
            day={this.props.formStore.assetInfo.release_date.day}
            onChange={release_date => this.props.formStore.UpdateAssetInfo("release_date", release_date)}
          />

          <MultiSelect
            name="genre"
            values={this.props.formStore.assetInfo.genre}
            onChange={genre => this.props.formStore.UpdateAssetInfo("genre", genre)}
            options={GENRES}
          />

          { this.InfoFields() }
        </div>
      </div>
    );
  }
}

export default AssetInfo;
