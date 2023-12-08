import { FC } from "react";
import LogoDesignComponent from "~/design/Logo";
import env from "~/config/env";
import { useTheme } from "~/util/store/theme";

type AppLogoProps = {
  className?: string;
  iconOnly?: boolean;
};

const basePath = `${env.VITE_BASE ?? "/"}`;

const Logo: FC<AppLogoProps> = ({ className, iconOnly }) => {
  const {
    VITE_LOGO_PATH_DARK_MODE: pathDarkMode,
    VITE_LOGO_PATH_LIGHT_MODE: pathLightMode,
  } = env;

  const theme = useTheme();

  if (pathLightMode && pathDarkMode) {
    return (
      <div className={className}>
        <div className="flex h-[32px] w-[134px] grow items-center">
          <LogoDesignComponent
            customLogo
            pathLightMode={`${basePath}${pathLightMode}`}
            pathDarkMode={`${basePath}${pathDarkMode}`}
            useDarkMode={theme === "dark"}
          />
        </div>
      </div>
    );
  }

  return (
    <LogoDesignComponent
      className={className}
      iconOnly={iconOnly}
      customLogo={false}
    />
  );
};

export default Logo;
