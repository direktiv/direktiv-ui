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
        ],
        fontSize: "14px",
        fontWeight: "bold",
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
            main: "#ffffff"
        },
    },
    components: {
        // Name of the component
        MuiPaginationItem: {
            defaultProps: {
                disableRipple: true,
            }
        },
        MuiTooltip:{
            defaultProps:{
                backgroundColor:"red"
            },
            styleOverrides:{
                tooltipArrow:{
                    backgroundColor:"#1a3041"
                },
                arrow:{
                    color:"#1a3041"
                }
            }
        }
    },
});

export default theme;