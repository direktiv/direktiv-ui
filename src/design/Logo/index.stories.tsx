import type { Meta, StoryObj } from "@storybook/react";
import Logo from "./index";
import { Switch } from "../Switch";
import { useState } from "react";

const meta = {
  title: "Components/Logo",
  component: Logo,
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => <Logo {...args} />,
  argTypes: {
    className: {
      table: {
        disable: true,
      },
    },
    iconOnly: {
      description: "icon version of the logo",
      control: "boolean",
      type: { name: "boolean", required: false },
    },
  },
};

export const WithOrWithoutLogo = () => (
  <div className="flex space-x-5">
    <Logo customLogo={false} />
    <Logo iconOnly customLogo={false} />
  </div>
);

export const PassClassNames = () => (
  <div className="flex space-x-5">
    <Logo className="w-20" customLogo={false} />
    <Logo className="w-24" customLogo={false} />
    <Logo customLogo={false} />
  </div>
);

export const CustomLogo = () => {
  const [darkMode, setDarkmode] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div>
        providing a custom logo to the component, requires to set a path for
        both light and dark mode and explicitly set the useDarkMode prop to
        either true or false.
      </div>
      <div>
        The custom logo
        <label htmlFor="dark-mode" style={{ paddingRight: 15 }}>
          Dark Mode
        </label>
        <Switch
          id="dark-mode"
          value={darkMode ? "on" : "off"}
          onCheckedChange={(newVal) => {
            setDarkmode(newVal);
          }}
        />
      </div>
      <div>
        <Logo
          customLogo={true}
          pathLightMode="https://placehold.jp/f5f5f5/000000/160x30.png"
          pathDarkMode="https://placehold.jp/000000/ffffff/160x30.png"
          useDarkMode={darkMode}
        />
      </div>
    </div>
  );
};
