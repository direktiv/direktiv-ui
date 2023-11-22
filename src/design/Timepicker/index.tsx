import * as React from "react";

import { Command, CommandGroup, CommandList } from "~/design/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

import Button from "../Button";
import { Clock } from "lucide-react";
// import * as Label from "@radix-ui/react-label";
import { Label } from "@radix-ui/react-label";
import { TimePickerInput } from "./timepicker-input";

function showOnlyTimeOfDate(date: Date) {
  const hours =
    date.getHours() < 10
      ? "0" + String(date.getHours())
      : String(date.getHours());
  const minutes =
    date.getMinutes() < 10
      ? "0" + String(date.getMinutes())
      : String(date.getMinutes());

  const seconds =
    date.getSeconds() < 10
      ? "0" + String(date.getSeconds())
      : String(date.getSeconds());
  const time = hours + ":" + minutes + ":" + seconds;
  return time;
}

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string | undefined) => void;
  time: string;
}

function TimePickerDemo({ date, setDate, time }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const dateInit = new Date(new Date().setHours(0, 0, 0, 0));
  //const time = showOnlyTimeOfDate(date);
  const time = showOnlyTimeOfDate(date);
  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <TimePickerInput
          picker="seconds"
          date={date}
          setDate={setDate}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4" />
      </div>
    </div>
  );
}

export default TimePickerDemo;
