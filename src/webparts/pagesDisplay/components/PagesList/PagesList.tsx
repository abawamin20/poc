import * as React from "react";
import { ReusableDetailList } from "../common/ReusableDetailList";
import PagesService from "./PagesService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PagesColumns } from "./PagesColumns";
import { IColumn } from "@fluentui/react";
// import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
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
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [pageSize] = React.useState<number>(2);
  const [startIndex, setStartIndex] = React.useState<number>(1);
  const [endIndex, setEndIndex] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number>(0);
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
    pageSizeAmount = pageSize,
    sortBy = "Created",
    isSortedDescending = isDecending,
    searchText = "",
    category = catagory
  ) => {
    const url = `${context.pageContext.web.serverRelativeUrl}/SitePages/${category}`;
    pagesService
      .getFilteredPages(
        page,
        pageSizeAmount,
        sortBy,
        isSortedDescending,
        url,
        searchText
      )
      .then((res) => {
        setTotalItems(res.length);
        const totalPages = Math.ceil(res.length / pageSize);
        if (totalPages === 0) {
          setTotalPages(1);
        } else setTotalPages(Math.ceil(res.length / pageSize));
        const startIndex = 1;
        setStartIndex(startIndex);
        const endIndex = res.slice(0, pageSize).length;
        setEndIndex(endIndex);
        setPaginatedPages(res.slice(0, pageSize));
        setPages(res);
      });
  };

  const getPages = (path: string) => {
    fetchPages(1, pageSize, "Created", true, searchText, path);
  };

  const sortPages = (column: IColumn) => {
    setSortBy(column.fieldName as string);
    if (column.fieldName === sortBy) {
      setIsDecending(!isDecending);
    } else {
      setIsDecending(true);
    }
    fetchPages(
      1,
      pageSize,
      column.fieldName,
      column.isSortedDescending,
      searchText
    );
  };

  const handlePageChange = (page: number) => {
    // Ensure page is an integer
    const currentPage = Math.ceil(page);

    // Update current page number state
    setCurrentPageNumber(currentPage);

    // Calculate slice indices for pagination
    const startIndex = (currentPage - 1) * pageSize;

    if (startIndex == 0) {
      setStartIndex(1);
    } else setStartIndex(startIndex);
    const endIndex = currentPage * pageSize;
    setEndIndex(endIndex);

    // Slice the 'pages' array to get the current page of data
    const paginated = pages.slice(startIndex, endIndex);

    // Update paginated pages state
    setPaginatedPages(paginated);
  };

  const handleSearch = () => {
    fetchPages(1, pageSize, "Created", true, searchText);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () =>
    handlePageChange(Math.max(currentPageNumber - 1, 1));
  const goToNextPage = () =>
    handlePageChange(Math.min(currentPageNumber + 1, totalPages));

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;

    if (!isNaN(inputValue)) {
      const page = parseInt(inputValue, 10);
      handlePageChange(page);
    } else {
      handlePageChange(0);
    }
  };

  return (
    <div className="w-pageSize0">
      <div className={`${styles.top}`}>
        <div
          className={`${styles["first-section"]} d-flex justify-content-between align-items-center py-2 px-2`}
        >
          <span className={`${styles.knowledgeText} fs-5`}>
            Knowledge base
            {catagory && <span className=""> . {catagory}</span>}
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

        <div
          className={`${styles["second-section"]} d-flex justify-content-between align-items-center fs-5 px-2 my-2`}
        >
          <div className="d-flex align-items-center my-1">
            <span
              onClick={goToFirstPage}
              className={`me-2 ${styles["pagination-btns"]} ${
                currentPageNumber === 1 && styles.disabledPagination
              }`}
            >
              <i className="fa fa-step-backward" aria-hidden="true"></i>
            </span>
            <span
              onClick={goToPreviousPage}
              className={`me-2 ${styles["pagination-btns"]} ${
                currentPageNumber === 1 && styles.disabledPagination
              }`}
            >
              <i className="fa fa-caret-left" aria-hidden="true"></i>
            </span>
            <span className={`me-2 fs-6`}>Page</span>
            <input
              type="text"
              value={currentPageNumber}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: 40,
                height: 30,
              }}
            />
            <span className="fs-6 mx-2">of {totalPages}</span>
            <span
              onClick={goToNextPage}
              className={`me-2 ${styles["pagination-btns"]} ${
                currentPageNumber >= totalPages ? styles.disabledPagination : ""
              }`}
            >
              <i className="fa fa-caret-right" aria-hidden="true"></i>
            </span>

            <span
              onClick={goToLastPage}
              className={`me-2 ${styles["pagination-btns"]} ${
                currentPageNumber >= totalPages ? styles.disabledPagination : ""
              }`}
            >
              <i className="fa fa-step-forward" aria-hidden="true"></i>
            </span>
          </div>

          {totalItems > 0 ? (
            <span className="fs-6">
              Displaying Articles {startIndex} - {endIndex} of {totalItems}
            </span>
          ) : (
            <span className="fs-6">No articles to display</span>
          )}
        </div>
      </div>

      <ReusableDetailList
        items={paginatedPages}
        columns={PagesColumns}
        category={catagory}
        sortPages={sortPages}
        sortBy={sortBy}
        siteUrl={window.location.origin}
        isDecending={isDecending}
      />
    </div>
  );
};

export default PagesList;
