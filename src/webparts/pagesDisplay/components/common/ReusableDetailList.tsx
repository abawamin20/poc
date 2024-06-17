import * as React from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  DetailsHeader,
} from "@fluentui/react/lib/DetailsList";

import { mergeStyles } from "@fluentui/react";

// Define custom header styles
const customHeaderClass = mergeStyles({
  backgroundColor: "#bcd8ed", // Custom background color
  color: "white", // Custom text color
  paddingTop: 0,
  paddingBottom: 0,
  header: {
    borderBottom: "1px solid #ccc",
  },
  cell: {
    borderRight: "1px solid #ccc",
    ":last-child": {
      borderRight: "none",
    },
  },
  row: {
    selectors: {
      "&:nth-child(even)": {
        backgroundColor: "#f3f2f1",
      },
      "&:hover": {
        backgroundColor: "#eaeaea",
      },
    },
  },
});

export interface IReusableDetailListProps {
  columns: (onColumnClick: any, sortBy: string) => IColumn[];
  items: any[];
  sortPages: (column: IColumn, isAscending: boolean) => void;
  sortBy: string;
  siteUrl: string;
}

export class ReusableDetailList extends React.Component<
  IReusableDetailListProps,
  {}
> {
  constructor(props: IReusableDetailListProps) {
    super(props);
  }

  componentDidUpdate(prevProps: IReusableDetailListProps) {
    if (prevProps.items !== this.props.items) {
      this.forceUpdate();
    }
  }

  _onRenderDetailsHeader = (props: any) => {
    if (!props) {
      return null;
    }

    // Apply custom styles to the header
    return (
      <DetailsHeader
        {...props}
        styles={{
          root: customHeaderClass, // Apply custom styles
        }}
      />
    );
  };

  public render() {
    const { columns, items, sortPages, sortBy } = this.props;

    return (
      <div>
        <DetailsList
          items={items}
          compact={false}
          columns={columns(sortPages, sortBy)}
          selectionMode={SelectionMode.none}
          getKey={this._getKey}
          setKey="none"
          layoutMode={DetailsListLayoutMode.fixedColumns}
          isHeaderVisible={true}
          onRenderDetailsHeader={this._onRenderDetailsHeader}
          onItemInvoked={this._onItemInvoked}
        />
      </div>
    );
  }

  private _getKey(item: any, index?: number): string {
    return item.key;
  }

  private _onItemInvoked = (item: any): void => {
    window.open(`${this.props.siteUrl}${item.FileRef}`, "_blank");
  };
}
