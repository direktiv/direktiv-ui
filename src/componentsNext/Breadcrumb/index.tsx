import {
  Breadcrumb as BreadcrumbLink,
  BreadcrumbRoot,
} from "~/design/Breadcrumbs";
import {
  ChevronsUpDown,
  Circle,
  Home,
  Loader2,
  PlusCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStaticItem,
  CommandStaticSeparator,
} from "~/design/Command";
import { Dialog, DialogContent, DialogTrigger } from "~/design/Dialog";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "~/design/Popover";
import React, { useState } from "react";
import { useNamespace, useNamespaceActions } from "~/util/store/namespace";

import Button from "~/design/Button";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import NamespaceCreate from "../NamespaceCreate";
import clsx from "clsx";
import { pages } from "~/util/router/pages";
import { useListNamespaces } from "~/api/namespaces/query/get";
import { useTranslation } from "react-i18next";

const Breadcrumb = () => {
  const { t } = useTranslation();
  const namespace = useNamespace();
  const {
    data: availableNamespaces,
    isLoading,
    isSuccess,
  } = useListNamespaces();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = React.useState(false);

  const { isExplorerPage } = pages.explorer.useParams();

  const { setNamespace } = useNamespaceActions();
  const navigate = useNavigate();

  if (!namespace) return null;

  const hasResults = isSuccess && availableNamespaces?.results.length > 0;

  const onNameSpaceChange = (namespace: string) => {
    setNamespace(namespace);
    navigate(pages.explorer.createHref({ namespace }));
  };
  return (
    <BreadcrumbRoot>
      <BreadcrumbLink noArrow>
        <Link
          to={pages.explorer.createHref({ namespace })}
          data-testid="breadcrumb-namespace"
        >
          <Home />
          {namespace}
        </Link>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                circle
                data-testid="dropdown-trg-namespace"
              >
                <ChevronsUpDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <Command>
                <CommandInput
                  placeholder={t("components.breadcrumb.searchPlaceholder")}
                />
                {hasResults && (
                  <CommandList className="max-h-[278px]">
                    <CommandEmpty>
                      {t("components.breadcrumb.notFound")}
                    </CommandEmpty>
                    <CommandGroup>
                      {availableNamespaces?.results.map((ns) => (
                        <CommandItem
                          key={ns.name}
                          value={ns.name}
                          onSelect={(currentValue: string) => {
                            onNameSpaceChange(currentValue);
                            setOpen(false);
                          }}
                        >
                          <Circle
                            className={clsx(
                              "mr-2 h-2 w-2 fill-current",
                              namespace === ns.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span>{ns.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                )}
                {isLoading && (
                  <CommandStaticItem>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("components.breadcrumb.loading")}
                  </CommandStaticItem>
                )}
                <CommandStaticSeparator />
                <DialogTrigger data-testid="new-namespace">
                  <CommandStaticItem>
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>{t("components.breadcrumb.createBtn")}</span>
                    </>
                  </CommandStaticItem>
                </DialogTrigger>
              </Command>
            </PopoverContent>
          </Popover>
          <DialogContent>
            <NamespaceCreate close={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </BreadcrumbLink>
      {isExplorerPage && <ExplorerBreadcrumb />}
    </BreadcrumbRoot>
  );
};

export default Breadcrumb;
