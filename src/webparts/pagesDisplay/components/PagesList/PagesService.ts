import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";

class PagesService {
  private _sp: SPFI;

  constructor(private context: WebPartContext) {
    this._sp = spfi().using(SPFx(this.context));
  }
  getFilteredPages = async (
    pageNumber: number,
    pageSize: number = 10,
    orderBy: string = "Created",
    isAscending: boolean = true,
    folderPath: string = "",
    searchText: string = ""
  ) => {
    const skip = (pageNumber - 1) * pageSize;
    const list = this._sp.web.lists.getByTitle("Site Pages");
    const filterQuery = `FileDirRef eq '${folderPath}'${
      searchText ? ` and substringof('${searchText}', Title)` : ""
    }`;

    const pages: any[] = await list.items
      .filter(filterQuery)
      .select(
        "Title",
        "Description",
        "FileLeafRef",
        "FileRef",
        "Modified",
        "Id"
      )
      .skip(skip)
      .top(pageSize)
      .orderBy(orderBy, isAscending)();

    return pages;
  };

  public async getItemCount(
    folderPath: string = "",
    searchText: string = ""
  ): Promise<number> {
    try {
      const list = this._sp.web.lists.getByTitle("Site Pages");
      const filterQuery = `FileDirRef eq '${folderPath}'${
        searchText ? ` and substringof('${searchText}', Title)` : ""
      }`;

      const pages: any[] = await list.items
        .filter(filterQuery)
        .select(
          "Title",
          "Description",
          "FileLeafRef",
          "FileRef",
          "Modified",
          "Id"
        )();
      console.log(pages);
      return pages.length;
    } catch (error) {
      console.error("Error in getItemCount:", error);
      throw error; // or handle error as needed
    }
  }
}

export default PagesService;
