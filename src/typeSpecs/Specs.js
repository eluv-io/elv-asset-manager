import EventSiteSpec from "./DropEventSite";
import TenantSpec from "./EventTenant";
import NFTCollectionSpec from "./NFTCollection";
import NFTTemplateSpec from "./NFTTemplate";
import MarketplaceSpec from "./Marketplace";
import MainSiteSpec from "./MainSite";

const Specs = {
  "Main Site": MainSiteSpec,
  "Event Site": EventSiteSpec,
  "Tenant": TenantSpec,
  "NFT Collection": NFTCollectionSpec,
  "NFT Template": NFTTemplateSpec,
  "Marketplace": MarketplaceSpec
};

export default Specs;
