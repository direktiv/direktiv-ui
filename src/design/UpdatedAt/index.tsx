import React, { HTMLAttributes, useCallback, useEffect } from "react";

import moment from "moment";

export type UpdatedAtProps = HTMLAttributes<HTMLDivElement> & {
  date?: string;
};
let interval: number;

const useForceRerender = () => {
  const [, setState] = React.useState({ value: 10 });
  function rerenderForcefully() {
    setState((prev) => ({ ...prev }));
  }
  return rerenderForcefully;
};

const UpdatedAt = React.forwardRef<HTMLDivElement, UpdatedAtProps>(
  ({ date }) => {
    const forceUpdate = useForceRerender();
    const checkTime = useCallback(() => {
      const prev = moment(date);
      const now = moment(new Date());
      const duration = moment.duration(prev.diff(now));
      const mins = duration.asMinutes();
      if (mins < 60) {
        forceUpdate();
      } else {
        clearInterval(interval);
        forceUpdate();
      }
    }, [date, forceUpdate]);
    useEffect(() => {
      const prev = moment(date);
      const now = moment(new Date());
      const duration = moment.duration(now.diff(prev));
      const mins = duration.asMinutes();
      if (mins < 60) {
        interval = setInterval(() => {
          checkTime();
        }, 60000) as unknown as number;
      }
      return () => {
        clearInterval(interval);
      };
    }, [date, checkTime]);
    return <>{moment(date).fromNow()}</>;
  }
);

UpdatedAt.displayName = "UpdatedAt";

export default UpdatedAt;
