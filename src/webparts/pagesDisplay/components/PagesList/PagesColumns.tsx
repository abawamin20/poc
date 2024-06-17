import * as React from "react";
import { IColumn } from "@fluentui/react";
import styles from "./pages.module.scss";
export const PagesColumns = (onColumnClick: any, sortBy: string): IColumn[] => [
  {
    key: "Id",
    name: "#",
    fieldName: "Id",
    minWidth: 10,
    maxWidth: 20,
    isRowHeader: true,
    isResizable: true,
    isSorted: sortBy === "Id",
    isSortedDescending: false,
    onColumnClick: onColumnClick,
    data: "string",
    isPadded: true,
  },
  {
    key: "Title",
    name: "Article",
    fieldName: "Title",
    minWidth: 500,
    maxWidth: 700,
    isRowHeader: true,
    isResizable: true,
    isSorted: sortBy === "Title",
    onColumnClick: onColumnClick,
    data: "string",
    isPadded: true,
    onRender(item) {
      return (
        <div className={`row`}>
          <div className="col-12 d-flex align-items-start justify-content-start flex-column">
            <div className={` ${styles.title}`}>
              <h5 className="">{item.Title}</h5>
            </div>
            <div className={`${styles.subTitle}`}>
              <span
                className={`${styles.knowledgeText} card-subtitle mb-2 text-muted`}
              >
                Knowledge base -
              </span>
              {item.Title}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    key: "Modified",
    name: "Modified",
    fieldName: "Modified",
    minWidth: 210,
    maxWidth: 350,
    isRowHeader: true,
    isResizable: true,
    isSorted: sortBy === "Title",
    onColumnClick: onColumnClick,
    data: "string",
    isPadded: true,
    onRender(item) {
      const date = new Date(item.Modified);

      const optionsDate: any = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      const formattedDate = date.toLocaleDateString("en-US", optionsDate);

      const optionsTime: any = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

      const formattedDateTime = `${formattedDate} ${formattedTime}`;
      return formattedDateTime;
    },
  },
];
