import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";

interface Term {
  Id: string;
  Name: string;
  Children?: Term[];
}

interface TermSet {
  setId: string;
  setName: string;
  terms: Term[];
}

interface TermGroup {
  groupId: string;
  groupName: string;
  sets: TermSet[];
}

interface TermSetListProps {
  context: WebPartContext;
}

const TermSetList: React.FC<TermSetListProps> = (props: TermSetListProps) => {
  const [termGroups, setTermGroups] = React.useState<TermGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTerms = async (
      groupId: string,
      setId: string,
      parentTermId?: string
    ): Promise<Term[]> => {
      const termsUrl = parentTermId
        ? `${props.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/groups('${groupId}')/sets('${setId}')/terms('${parentTermId}')/children`
        : `${props.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/groups('${groupId}')/sets('${setId}')/terms`;

      try {
        const response = await props.context.spHttpClient.get(
          termsUrl,
          SPHttpClient.configurations.v1
        );
        if (!response.ok) {
          throw new Error("Failed to fetch terms");
        }
        const termsData = await response.json();

        const terms = await Promise.all(
          termsData.value.map(async (term: any, index: number) => {
            const children =
              term.childrenCount > 0
                ? await fetchTerms(groupId, setId, term.id)
                : [];
            return {
              Id: index.toString(), // Use index as the ID
              Name: term.labels.length > 0 ? term.labels[0].name : "",
              Children: children,
            };
          })
        );

        return terms;
      } catch (error) {
        console.error(`Error fetching terms for set ${setId}:`, error);
        return [];
      }
    };

    const fetchData = async () => {
      try {
        const apiUrl = `${props.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/groups`;
        const response = await props.context.spHttpClient.get(
          apiUrl,
          SPHttpClient.configurations.v1
        );
        if (!response.ok) {
          throw new Error("Failed to fetch term groups");
        }
        const data = await response.json();

        const siteTermGroups = data.value;
        const termGroups: TermGroup[] = [];

        for (const group of siteTermGroups) {
          const termSets: TermSet[] = [];
          try {
            const setsApiUrl = `${props.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/groups('${group.id}')/sets`;
            const setsResponse = await props.context.spHttpClient.get(
              setsApiUrl,
              SPHttpClient.configurations.v1
            );
            if (!setsResponse.ok) {
              throw new Error("Failed to fetch term sets");
            }
            const setsData = await setsResponse.json();

            for (const set of setsData.value) {
              try {
                const terms = await fetchTerms(group.id, set.id);
                termSets.push({
                  setId: set.id,
                  setName: set.localizedNames[0].name,
                  terms: terms,
                });
              } catch (error) {
                console.error(`Error fetching terms for set ${set.id}:`, error);
              }
            }

            termGroups.push({
              groupId: group.id,
              groupName: group.name,
              sets: termSets,
            });
          } catch (error) {
            console.error(`Error fetching sets for group ${group.id}:`, error);
            termGroups.push({
              groupId: group.id,
              groupName: group.name,
              sets: [], // Use empty array if sets cannot be fetched
            });
          }
        }

        setTermGroups(termGroups);
      } catch (error) {
        console.error("Error fetching term groups:", error);
        setTermGroups([]); // Use empty array if term groups cannot be fetched
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [props.context]);

  const renderTreeItems = (terms: Term[]) => {
    return terms.map((term) => (
      <TreeItem
        key={term.Id}
        itemType={term.Children && term.Children.length > 0 ? "branch" : "leaf"}
      >
        <TreeItemLayout>{term.Name}</TreeItemLayout>
        {term.Children && term.Children.length > 0 && (
          <Tree>{renderTreeItems(term.Children)}</Tree>
        )}
      </TreeItem>
    ));
  };

  const renderTermGroups = (groups: TermGroup[]) => {
    return groups.map((group) => (
      <TreeItem key={group.groupId} itemType="branch">
        <TreeItemLayout>{group.groupName}</TreeItemLayout>
        <Tree>
          {group.sets.map((set) => (
            <TreeItem key={set.setId} itemType="branch">
              <TreeItemLayout>{set.setName}</TreeItemLayout>
              <Tree>{renderTreeItems(set.terms)}</Tree>
            </TreeItem>
          ))}
        </Tree>
      </TreeItem>
    ));
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading term groups...</p>
      ) : (
        <Tree aria-label="Term Groups Tree">
          {renderTermGroups(termGroups)}
        </Tree>
      )}
    </div>
  );
};

export default TermSetList;
