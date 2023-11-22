import { Command, CommandGroup, CommandList } from "~/design/Command";
import type { Meta, StoryObj } from "@storybook/react";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/design/Popover";
import { addDays, format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Button from "~/design/Button";
import { ButtonBar } from "~/design/ButtonBar";
import { Datepicker } from "../Datepicker";
import Input from "~/design/Input";
import { InputWithButton } from "~/design/InputWithButton";
import { Label } from "@radix-ui/react-label";
import React from "react";
import TimePickerDemo from "./";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const meta = {
  title: "Components/Timepicker",
  component: TimePickerDemo,
} satisfies Meta<typeof TimePickerDemo>;

export default meta;

export const Default = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <TimePickerDemo date={date} setDate={setDate}></TimePickerDemo>;
};

export const TimepickerWithTextinput = () => {
  const [date, setDate] = React.useState<Date>();
  const [name, setName] = React.useState<string>(() => "filename.yaml");

  //  const [inputValue, setInputValue] = useState<string>(value || "");
  return (
    <div className="m-2 flex flex-row flex-wrap gap-2">
      <ButtonBar>
        <Button variant="outline" asChild>
          <label>name</label>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <span>{name}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <Command>
              <CommandList>
                <CommandGroup heading="filter by name">
                  <InputWithButton>
                    <Input
                      autoFocus
                      placeholder="filename.yaml"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                    <Button icon variant="ghost">
                      <ArrowRight />
                    </Button>
                  </InputWithButton>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" icon>
          <X />
        </Button>
      </ButtonBar>

      <ButtonBar>
        <Button variant="outline" asChild>
          <label>created after</label>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <span>{time}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <TimePickerDemo
              time={time}
              date={date}
              setDate={setDate}
            ></TimePickerDemo>
          </PopoverContent>
        </Popover>
        <Button variant="outline" icon>
          <X />
        </Button>
      </ButtonBar>
    </div>
  );
};

// To solve the problem with the missing shadow around the Popover, I have to use Popover only here, not inside of the Timepicker Component

export const TimepickerWithTextinput2 = () => {
  const [date, setDate] = React.useState<Date>();
  const [name, setName] = React.useState<string>();
  //  const [inputValue, setInputValue] = useState<string>(value || "");
  return (
    <div className="m-2 flex flex-row flex-wrap gap-2">
      <ButtonBar>
        <Button variant="outline" asChild>
          <label>name</label>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <span>{name}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <Command>
              <CommandList>
                <CommandGroup heading="filter by name">
                  <InputWithButton>
                    <Input
                      autoFocus
                      placeholder="filename.yaml"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                    <Button icon variant="ghost">
                      <ArrowRight />
                    </Button>
                  </InputWithButton>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" icon>
          <X />
        </Button>
      </ButtonBar>

      <ButtonBar>
        <Button variant="outline" asChild>
          <label>created after</label>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <span>{time}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <Command>
              <CommandList>
                <CommandGroup heading="filter by time">
                  <TimePickerDemo
                    time={time}
                    date={date}
                    setDate={setDate}
                  ></TimePickerDemo>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" icon>
          <X />
        </Button>
      </ButtonBar>
    </div>
  );
};

export const ButtonBarWithTimepicker = () => {
  // const [state, setState] = useState(() => () => someValue);
  const [date, setDate] = React.useState<Date>(() => new Date());
  return (
    <div className="m-2 flex flex-row flex-wrap gap-2">
      <ButtonBar>
        <Button variant="outline" asChild>
          <label>Created after</label>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <Datepicker
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <TimePickerDemo date={date} setDate={setDate}></TimePickerDemo>
        <Button variant="outline" icon>
          <X />
        </Button>
      </ButtonBar>
      <Button variant="outline">
        <Plus />
      </Button>
    </div>
  );
};
