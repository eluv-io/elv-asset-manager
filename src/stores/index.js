import {configure, observable, action, flow} from "mobx";

import {FrameClient} from "elv-client-js/src/FrameClient";
import ContentStore from "./Content";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable client;
  @observable balance = 0;
  @observable params = {};

  @action.bound
  InitializeClient = flow(function * () {
    this.client = new FrameClient({
      target: window.parent,
      timeout: 30
    });

    this.balance = parseFloat(
      yield this.client.GetBalance({
        address: yield this.client.CurrentAccountAddress()
      })
    );

    let queryParams = window.location.search.split("?")[1];
    queryParams = queryParams.split("&");
    queryParams.forEach(param => {
      const [key, value] = param.split("=");
      this.params[key] = value;
    });

    if(!this.params.libraryId) {
      throw Error("Missing query parameter 'libraryId'");
    } else if(!this.params.objectId) {
      throw Error("Missing query parameter 'objectId'");
    }
  })
}

export const rootStore = new RootStore();
export const contentStore = new ContentStore(rootStore);
