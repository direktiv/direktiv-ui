import { createTheme } from '@mui/material/styles';

const Colors = {
    primary: "#3E94C5",
    secondary: "#95defb",
    light: "#566875"
};

const theme = createTheme({
    typography: {
        fontFamily: [
            "Inter"
        ].join(","),
        body1:{
            fontWeight: "bold",
            fontSize: "14px"
        }
    },
    palette: {
        primary: {
            main: Colors.primary,
            light: "#44a3d9"
        },
        secondary: {
            main: Colors.secondary
        },
        text: {
            primary: Colors.light
        },
        info: {
            main: "#566875"
        },
        error: {
            main: "#ff616d"
        },
        terminal: {
            main: "#355166",
            light: "#3a5970",
        }
    },
components: {
        // Name of the component
        MuiPaginationItem: {
            defaultProps: {
                // disableRipple: true,
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltipArrow: {
                    backgroundColor: "#1a3041"
                },
                arrow: {
                    color: "#1a3041"
                }
            }
        }
    },
});

declare module '@mui/material/styles' {
    interface Palette {
        terminal: Palette['primary'];
    }

    // allow configuration using `createTheme`
    interface PaletteOptions {
        terminal?: PaletteOptions['primary'];
    }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        terminal: true;
    }
}

export default theme;