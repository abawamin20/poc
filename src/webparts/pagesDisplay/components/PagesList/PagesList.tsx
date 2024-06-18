import * as React from "react";
import { ReusableDetailList } from "../common/ReusableDetailList";
import PagesService from "./PagesService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PagesColumns } from "./PagesColumns";
import { IColumn } from "@fluentui/react";
import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import { makeStyles, useId, Input } from "@fluentui/react-components";
import styles from "./pages.module.scss";
import "./pages.css";

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
  const context = props.context;
  const [catagory, setCatagory] = React.useState<string>("");
  const [searchText, setSearchText] = React.useState<string>("");
  const [pages, setPages] = React.useState<any[]>([]);
  const [paginatedPages, setPaginatedPages] = React.useState<any[]>([]);
  const [sortBy, setSortBy] = React.useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number | null>(null);
  const [isDecending, setIsDecending] = React.useState<boolean>(false);
  const pagesService = new PagesService(context);
  const inputId = useId("input");
  const inputStyles = useStyles();

  React.useEffect(() => {
    window.addEventListener("catagory", (e: any) => {
      setCatagory(e.detail);
      getPages(e.detail);
    });
  }, []);

  const fetchPages = (
    page = 1,
    pageSize = 10,
    sortBy = "Created",
    isSortedDescending = isDecending,
    searchText = "",
    category = catagory
  ) => {
    const url = `${context.pageContext.web.serverRelativeUrl}/SitePages/${category}`;
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
        setTotalItems(res.length);
        setPaginatedPages(res.slice(0, pageSize));
        setPages(res);
      });
  };

  const getPages = (path: string) => {
    fetchPages(1, 10, "Created", true, searchText, path);
  };

  const sortPages = (column: IColumn) => {
    setSortBy(column.fieldName as string);
    if (column.fieldName === sortBy) {
      setIsDecending(!isDecending);
    } else {
      setIsDecending(true);
    }
    fetchPages(1, 10, column.fieldName, column.isSortedDescending, searchText);
  };

  const handlePageChange = (page: number) => {
    // Ensure page is an integer
    const currentPage = Math.ceil(page);

    // Update current page number state
    setCurrentPageNumber(currentPage);

    // Calculate slice indices for pagination
    const startIndex = (currentPage - 1) * 10;
    const endIndex = currentPage * 10;

    // Slice the 'pages' array to get the current page of data
    const paginated = pages.slice(startIndex, endIndex);

    // Update paginated pages state
    setPaginatedPages(paginated);
  };

  const handleSearch = () => {
    fetchPages(1, 10, "Created", true, searchText);
  };

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

          <div className={`${inputStyles.root} d-flex align-items-center me-2`}>
            <label className="fs-6 me-2">Search this Knowledge Base</label>
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
            className={`${styles["second-section"]} d-flex justify-content-between align-items-center fs-5 fw-bold px-2 my-2`}
          >
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
            <span>
              Displaying Articles {currentPageNumber} - {currentPageNumber + 9}{" "}
              of {totalItems}
            </span>
          </div>
        )}
      </div>

      {pages?.length > 0 && (
        <ReusableDetailList
          items={paginatedPages}
          columns={PagesColumns}
          category={catagory}
          sortPages={sortPages}
          sortBy={sortBy}
          siteUrl={window.location.origin}
          isDecending={isDecending}
        />
      )}
    </div>
  );
};

export default PagesList;
