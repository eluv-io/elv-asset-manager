import EventSiteSpec from "./DropEventSite";
import TenantSpec from "./EventTenant";
import NFTCollectionSpec from "./NFTCollection";
import NFTTemplateSpec from "./NFTTemplate";
import MarketplaceSpec from "./Marketplace";
import MainSiteSpec from "./MainSite";
import MediaCatalogSpec from "./MediaCatalog";

const Specs = {
  "Main Site": MainSiteSpec,
  "Event Site": EventSiteSpec,
  "Tenant": TenantSpec,
  "NFT Collection": NFTCollectionSpec,
  "NFT Template": NFTTemplateSpec,
  "Marketplace": MarketplaceSpec,
  "Media Catalog": MediaCatalogSpec
};

export default Specs;
