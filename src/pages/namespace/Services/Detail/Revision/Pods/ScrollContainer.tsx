import { LogEntry, Logs } from "~/design/Logs";
import { useEffect, useRef, useState } from "react";

import { ArrowDown } from "lucide-react";
import Button from "~/design/Button";
import { twMergeClsx } from "~/util/helpers";
import { useLogsPreferencesWordWrap } from "~/util/store/logs";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";

const ScrollContainer = ({ logs }: { logs: string[] }) => {
  const wordWrap = useLogsPreferencesWordWrap();

  const { t } = useTranslation();

  const [watch, setWatch] = useState(true);

  // The scrollable element for the list
  const parentRef = useRef<HTMLDivElement | null>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    /**
     * overscan is the number of items to render above and below
     * the visible window. More items = less flickering when
     * scrolling, but more memory usage and initial load time.
     * I tested it with around 2000 items and 40 was a good fit
     * to have no flickering with pretty high scrolling speed.
     */
    overscan: 40,
    getItemKey: (index) => index,
  });

  useEffect(() => {
    if (logs.length && watch) {
      /**
       * monkey patch ahead 🙈
       * calling rowVirtualizer.scrollToIndex(logData?.results.length);
       * is supposed to scroll to the bottom of the list, but it doesn't
       * work when the height of the line is dynamic. The calcuation that
       * is used only takes the result of estimateSize call into account
       * (we can test that by setting estimateSize very high)
       *
       * the only solution that workd for now is calling
       * rowVirtualizer.scrollElement with a very high top value
       * two times in a row, with a small delay for one a render
       * cycle in between
       */
      rowVirtualizer.scrollElement?.scrollTo({
        top: 999999999999999,
      });

      const timeOut = setTimeout(() => {
        rowVirtualizer.scrollElement?.scrollTo({
          top: 999999999999999,
        });
      }, 10);

      return () => {
        clearTimeout(timeOut);
      };
    }
  }, [logs.length, rowVirtualizer, watch]);

  const items = rowVirtualizer.getVirtualItems();

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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${items[0]?.start}px)`,
          }}
        >
          {items.map((virtualItem) => {
            const line = logs[virtualItem.index] ?? "";
            return (
              <LogEntry
                key={virtualItem.key}
                data-index={virtualItem.key}
                ref={rowVirtualizer.measureElement}
              >
                {line}
              </LogEntry>
            );
          })}
        </div>
      </div>
      <div
        className={twMergeClsx(
          "absolute box-border flex w-full pr-10",
          "justify-center transition-all",
          "aria-[hidden=true]:pointer-events-none aria-[hidden=true]:bottom-6 aria-[hidden=true]:opacity-0",
          "aria-[hidden=false]:bottom-11 aria-[hidden=false]:opacity-100"
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
          {t("pages.services.revision.detail.logs.followLogs")}
          <ArrowDown />
        </Button>
      </div>
    </Logs>
  );
};

export default ScrollContainer;