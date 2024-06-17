import * as React from "react";
import type { IPagesDisplayProps } from "./IPagesDisplayProps";
import PagesList from "./PagesList/PagesList";
import { SPComponentLoader } from "@microsoft/sp-loader";

export default class PagesDisplay extends React.Component<
  IPagesDisplayProps,
  {}
> {
  constructor(props: IPagesDisplayProps) {
    super(props);
    const cssURL =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css";
    SPComponentLoader.loadCss(cssURL);
  }
  public render(): React.ReactElement<IPagesDisplayProps> {
    return <PagesList context={this.props.context} />;
  }
}
