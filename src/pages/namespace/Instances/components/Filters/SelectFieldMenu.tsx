import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/design/Command";

import { FiltersObj } from "~/api/instances/query/get";
import { useTranslation } from "react-i18next";

export const SelectFieldMenu = ({
  options,
  onSelect,
}: {
  onSelect: (value: keyof FiltersObj) => void;
  options: Array<keyof FiltersObj>;
}) => {
  const { t } = useTranslation();
  return (
    <Command>
      <CommandInput
        placeholder={t("pages.instances.list.filter.placeholder.mainMenu")}
      />
      <CommandList>
        <CommandGroup
          heading={t("pages.instances.list.filter.menuHeading.main")}
        >
          {options.map((option) => (
            <CommandItem
              data-testid={`filter-field-${option}`}
              key={option}
              onSelect={() => onSelect(option)}
            >
              {t(`pages.instances.list.filter.field.${option}`)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
