import "./style.css";

import { Link, useLocation, useSearchParams } from "react-router-dom";

import FlexBox from "../flexbox";
import { GenerateRandomKey } from "../../util";
import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";

export interface BreadcrumbsProps {
  /**
   * Current selected namespace. If unset, breadcrumb will not render.
   */
  namespace: string;
  /**
   * Any Additional React Nodes to append to end of breadcrumb container
   */
  additionalChildren?: React.ReactNode;
}

/**
 *   A component that will generate a breadcrumb list of links depending on the current route and namespace.
 *   This component requires to be a descendant of a react-router Router.
 */
function Breadcrumbs({ namespace, additionalChildren }: BreadcrumbsProps) {
  const location = useLocation();

  const segments = location.pathname.split("/");
  const length = segments.length;

  // Custom breadcrumb names
  const routes = [
    { path: "/jq", breadcrumb: "JQ Playground" },
    // { path: '/g/services', breadcrumb: 'Global Services' },
    // { path: '/g/registries', breadcrumb: 'Global Registries'},
    { path: "/n/:namespace/services", breadcrumb: "Namespace Services" },
  ];

  /**
   * Temporary workaround until we upgrade to the new UI. useBreadcrumbs capitalizes all
   * breadcrumbs and removes dashes. We don't want that for namespaces and uuids.
   * The only way to override this is to provide custom route objects.
   * This generates route objects based on the current url.
   */
  for (let i = 2; i < length; i++) {
    routes.push({
      path: segments.slice(0, i + 1).join("/"),
      breadcrumb: segments[i],
    });
  }

  const breadcrumbs = useBreadcrumbs(routes);
  const [searchParams] = useSearchParams(); // removed 'setSearchParams' from square brackets (this should not affect anything: search 'destructuring assignment')

  if (!namespace) {
    return null;
  }

  return (
    <FlexBox id="breadcrumb-list">
      <ul>
        {breadcrumbs.length < 9 ? (
          breadcrumbs.map((obj) => {
            // ignore breadcrumbs for dividers
            if (
              obj.key === "/g" ||
              obj.key === "/n" ||
              obj.key === "/" ||
              obj.key === `/n/${namespace}/explorer` ||
              obj.key === `/n/${namespace}/mirror`
            ) {
              return "";
            }
            const key = GenerateRandomKey("crumb-");

            return (
              <li
                id={key}
                key={key.replace(
                  `/n/${namespace}/mirror`,
                  `/n/${namespace}/explorer`
                )}
              >
                <Link
                  to={obj.key.replace(
                    `/n/${namespace}/mirror`,
                    `/n/${namespace}/explorer`
                  )}
                >
                  {obj.breadcrumb}
                </Link>
              </li>
            );
          })
        ) : (
          <>
            {breadcrumbs.slice(0, 6).map((obj) => {
              if (
                obj.key === "/g" ||
                obj.key === "/n" ||
                obj.key === "/" ||
                obj.key === `/n/${namespace}/explorer` ||
                obj.key === `/n/${namespace}/mirror`
              ) {
                return "";
              }
              const key = GenerateRandomKey("crumb-");

              return (
                <li
                  id={key}
                  key={key.replace(
                    `/n/${namespace}/mirror`,
                    `/n/${namespace}/explorer`
                  )}
                >
                  <Link
                    to={obj.key.replace(
                      `/n/${namespace}/mirror`,
                      `/n/${namespace}/explorer`
                    )}
                  >
                    {obj.breadcrumb}
                  </Link>
                </li>
              );
            })}
            <li id="crumb-divider" key="crumb-divider">
              <span>{". . . "}</span>
            </li>
            {breadcrumbs.slice(-3).map((obj) => {
              const key = GenerateRandomKey("crumb-");

              return (
                <li
                  id={key}
                  key={key.replace(
                    `/n/${namespace}/mirror`,
                    `/n/${namespace}/explorer`
                  )}
                >
                  <Link
                    to={obj.key.replace(
                      `/n/${namespace}/mirror`,
                      `/n/${namespace}/explorer`
                    )}
                  >
                    {obj.breadcrumb}
                  </Link>
                </li>
              );
            })}
          </>
        )}

        {searchParams.get("function") && searchParams.get("version") ? (
          <li
            id={`${searchParams.get("function")}-${searchParams.get(
              "version"
            )}`}
            key={`${searchParams.get("function")}-${searchParams.get(
              "version"
            )}`}
          >
            <Link
              to={`${window.location.pathname}?function=${searchParams.get(
                "function"
              )}&version=${searchParams.get("version")}`}
            >
              {searchParams.get("function")}
            </Link>
          </li>
        ) : (
          ""
        )}
        {searchParams.get("revision") &&
        searchParams.get("function") &&
        searchParams.get("version") ? (
          <li
            id={`${searchParams.get("function")}-${searchParams.get(
              "version"
            )}-${searchParams.get("revision")}`}
            key={`${searchParams.get("function")}-${searchParams.get(
              "version"
            )}-${searchParams.get("revision")}`}
          >
            <Link
              to={`${window.location.pathname}?function=${searchParams.get(
                "function"
              )}&version=${searchParams.get(
                "version"
              )}&revision=${searchParams.get("revision")}`}
            >
              {searchParams.get("revision")}
            </Link>
          </li>
        ) : (
          ""
        )}
      </ul>
      {additionalChildren}
    </FlexBox>
  );
}

export default Breadcrumbs;
