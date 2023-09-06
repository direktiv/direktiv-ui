import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/design/Select";

import { useTranslation } from "react-i18next";
import { z } from "zod";

const mimeTypes = [
  { label: "JSON", value: "application/json" },
  { label: "YAML", value: "application/yaml" },
  { label: "shell", value: "application/x-sh" },
  { label: "plaintext", value: "text/plain" },
  { label: "HTML", value: "text/html" },
  { label: "CSS", value: "text/css" },
];

export const mimeTypeToLanguageDict = {
  "application/json": "json",
  "application/yaml": "yaml",
  "application/x-sh": "shell",
  "text/plain": "plaintext",
  "text/html": "html",
  "text/css": "css",
} as const;

export const getLanguageFromMimeType = (mimeType: string) => {
  const parsed = TextMimeTypeSchema.safeParse(mimeType);
  if (parsed.success) {
    return mimeTypeToLanguageDict[parsed.data];
  }
  return undefined;
};

export const MimeTypeSchema = z.string();
export type MimeTypeType = z.infer<typeof MimeTypeSchema>;

export const TextMimeTypeSchema = z.enum([
  "application/json",
  "application/yaml",
  "application/x-sh",
  "text/plain",
  "text/html",
  "text/css",
]);

export type TextMimeTypeType = z.infer<typeof TextMimeTypeSchema>;

const MimeTypeSelect = ({
  id,
  mimeType,
  onChange,
  loading = false,
}: {
  id?: string;
  loading?: boolean;
  mimeType: string | undefined;
  onChange: (value: MimeTypeType) => void;
}) => {
  const { t } = useTranslation();

  const hasNonTextMimeType = !TextMimeTypeSchema.safeParse(mimeType).success;

  return (
    <Select
      onValueChange={onChange}
      defaultValue={mimeType}
      value={hasNonTextMimeType ? undefined : mimeType}
    >
      <SelectTrigger
        id={id}
        loading={loading}
        variant="outline"
        block
        data-testid="variable-trg-mimetype"
        disabled={hasNonTextMimeType}
      >
        <SelectValue
          placeholder={t("pages.settings.variables.edit.mimeType.placeholder")}
        >
          {mimeType}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {mimeTypes.map((type) => (
          <SelectItem
            key={type.value}
            value={type.value}
            data-testid={`var-mimetype-${type.value}`}
          >
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MimeTypeSelect;
