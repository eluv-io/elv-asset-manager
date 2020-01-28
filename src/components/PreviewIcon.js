import URI from "urijs";
import UrlJoin from "url-join";
import {CroppedIcon, ImageIcon, ToolTip} from "elv-components-js";
import React from "react";
import {inject, observer} from "mobx-react";
import Image from "../static/icons/image.svg";

const PreviewIcon =
  inject("contentStore")(
    observer(
      ({contentStore, imageKey, imagePath, targetHash}) => {
        if(!imagePath || !contentStore.baseFileUrls[targetHash]) { return <div className="preview-icon" />; }

        const uri = URI(contentStore.baseFileUrls[targetHash]);
        uri.path(UrlJoin(uri.path(), imagePath).replace("//", "/"));

        return (
          <ToolTip
            key={`preview-icon-${imageKey}`}
            className={"file-image-preview-tooltip"}
            content={
              <CroppedIcon
                icon={uri.toString()}
                title={imagePath}
                className="file-image-preview"
              />
            }
          >
            <ImageIcon
              icon={Image}
              label={"Preview " + imageKey}
              className="preview-icon"
            />
          </ToolTip>
        );
      }
    )
  );

export default PreviewIcon;
