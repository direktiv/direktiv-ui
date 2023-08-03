import { ArrowDown, Dot, Loader2, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFilters, useInstanceId } from "../state/instanceContext";

import Button from "~/design/Button";
import Entry from "./Entry";
import { Logs } from "~/design/Logs";
import { twMergeClsx } from "~/util/helpers";
import { useInstanceDetails } from "~/api/instances/query/details";
import { useLogs } from "~/api/logs/query/get";
import { useLogsPreferencesWordWrap } from "~/util/store/logs";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";

const ScrollContainer = () => {
  const instanceId = useInstanceId();
  const wordWrap = useLogsPreferencesWordWrap();
  const { data: instanceDetailsData } = useInstanceDetails({ instanceId });

  const { t } = useTranslation();

  const filters = useFilters();

  const { data: logData } = useLogs({
    instanceId,
    filters,
  });
  const [watch, setWatch] = useState(true);

  // The scrollable element for the list
  const parentRef = useRef<HTMLDivElement | null>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: logData?.results.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    getItemKey: (index) => logData?.results[index]?.t ?? index,
  });

  useEffect(() => {
    if (logData?.results.length && watch) {
      rowVirtualizer.scrollToIndex(logData?.results.length);
    }
  }, [logData?.results.length, rowVirtualizer, watch]);

  const isPending = instanceDetailsData?.instance?.status === "pending";

  if (!logData) return null;

  return (
    <Logs
      wordWrap={wordWrap}
      className="h-full overflow-scroll"
      ref={parentRef}
      onScroll={(e) => {
        const element = e.target as HTMLDivElement;
        if (element) {
          const { scrollHeight, scrollTop, clientHeight } = element;
          const scrollDistanceToBottom =
            scrollHeight - scrollTop - clientHeight;
          setWatch(scrollDistanceToBottom < 100);
        }
      }}
    >
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const logEntry = logData.results[virtualItem.index];
          if (!logEntry) return null;
          return (
            <Entry
              key={virtualItem.key}
              logEntry={logEntry}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
      {isPending && (
        <div
          className={twMergeClsx(
            "absolute box-border flex w-full pr-10",
            "justify-center transition-all",
            "aria-[hidden=true]:pointer-events-none aria-[hidden=true]:bottom-5 aria-[hidden=true]:opacity-0",
            "aria-[hidden=false]:bottom-10 aria-[hidden=false]:opacity-100"
          )}
          aria-hidden={watch ? "true" : "false"}
        >
          <Button
            className="bg-white dark:bg-black"
            variant="outline"
            size="sm"
            onClick={() => {
              setWatch(true);
            }}
          >
            <ArrowDown />
            {t("pages.instances.detail.logs.followLogs")}
            <ArrowDown />
          </Button>
        </div>
      )}
    </Logs>
  );
};

export default ScrollContainer;
