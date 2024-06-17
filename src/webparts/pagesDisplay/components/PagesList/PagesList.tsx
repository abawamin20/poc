import * as React from "react";
import { ReusableDetailList } from "../common/ReusableDetailList";
import PagesService from "./PagesService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PagesColumns } from "./PagesColumns";
import { IColumn } from "@fluentui/react";
import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import { makeStyles, useId, Input } from "@fluentui/react-components";
import styles from "./pages.module.scss";

export interface IPagesListProps {
  context: WebPartContext;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: "2px",
    maxWidth: "400px",
    alignItems: "center",
  },
});

const PagesList = (props: IPagesListProps) => {
  const [catagory, setCatagory] = React.useState<string>("");
  const [searchText, setSearchText] = React.useState<string>("");
  const [pages, setPages] = React.useState<any[]>([]);
  const [sortBy, setSortBy] = React.useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number | null>(null);

  const pagesService = new PagesService(props.context);
  React.useEffect(() => {
    window.addEventListener("catagory", (e: any) => {
      console.log(35, e.detail);
      setCatagory(e.detail);
      getPages(e.detail);
    });
  }, []);

  const fetchPages = (
    page = 1,
    pageSize = 10,
    sortBy = "Created",
    isSortedDescending = true,
    searchText = "",
    category = catagory
  ) => {
    const url = `${props.context.pageContext.web.serverRelativeUrl}/SitePages/${category}`;
    pagesService
      .getFilteredPages(
        page,
        pageSize,
        sortBy,
        isSortedDescending,
        url,
        searchText
      )
      .then((res) => {
        setPages(res);
      });
  };

  const getPages = (path: string) => {
    fetchPages(1, 10, "Created", true, searchText, path);
    updatetotalItems(path);
  };

  const sortPages = (column: IColumn) => {
    setSortBy(column.fieldName as string);
    fetchPages(1, 10, column.fieldName, column.isSortedDescending, searchText);
  };

  const handlePageChange = (page: number) => {
    setCurrentPageNumber(page);
    fetchPages(page, 10, "Created", true, searchText);
  };

  const handleSearch = () => {
    fetchPages(1, 10, "Created", true, searchText);
  };

  const updatetotalItems = (path: any) => {
    setTotalItems(null);
    pagesService
      .getItemCount(
        `${props.context.pageContext.web.serverRelativeUrl}/SitePages/${path}`,
        searchText
      )
      .then((count: any) => {
        console.log(count);
        setTotalItems(count);
      });
  };

  const inputId = useId("input");
  const inputStyles = useStyles();
  console.log(totalItems);
  return (
    <div className="w-100">
      <div className={`${styles.top}`}>
        <div
          className={`${styles["first-section"]} d-flex justify-content-between align-items-center py-2 px-2`}
        >
          <span className={`${styles.knowledgeText} fs-5`}>
            Knowledge base -{" "}
            <span className="fs-6 badge bg-primary">{catagory}</span>
          </span>

          <div className={inputStyles.root}>
            <Input
              id={inputId}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search"
            />
          </div>
        </div>

        {pages?.length > 0 && (
          <div
            className={`d-flex justify-content-between align-items-center fs-5 fw-bold my-3`}
          >
            <div></div>

            <span>
              Displaying Articles {currentPageNumber} - {currentPageNumber + 9}{" "}
              of {totalItems}
            </span>
          </div>
        )}
      </div>

      {pages?.length > 0 && (
        <ReusableDetailList
          items={pages}
          columns={PagesColumns}
          sortPages={sortPages}
          sortBy={sortBy}
          siteUrl={window.location.origin}
        />
      )}

      {totalItems ? (
        <Pagination
          currentPage={currentPageNumber}
          totalPages={Math.ceil(totalItems / 10)}
          onChange={(page) => handlePageChange(page)}
          limiterIcon={"Emoji12"}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default PagesList;
