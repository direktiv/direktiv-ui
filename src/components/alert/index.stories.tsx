import React from 'react';
import Alert, { AlertProps } from "./index"
import { ComponentStory, ComponentMeta } from '@storybook/react';
import '../../App.css';
import './style.css'


export default {
    title: 'Components/Alert',
    component: Alert,
    argTypes: {
        severity: {
          options: ['success', 'info', 'warning', 'error'],
          control: { type: 'select' },
        },
        variant: {
            options: ['standard', 'filled', 'outlined'],
            control: { type: 'select' },
            defaultValue: 'standard',
        },
        // grow: {
        //     // defaultValue: false,
        //     control: { type: "boolean" },
        //     table: {
        //         type: { summary: 'boolean' },
        //         defaultValue: { summary: true },
        //     }
        // },
        children: {
            defaultValue: "Hello this is an example alert message!",
            control: { type: "text" }
        }
    },
} as ComponentMeta<typeof Alert>;

const Template: ComponentStory<typeof Alert> = (args) => <Alert {...args} />;


export const Default = Template.bind({});
Default.args = { severity: "info", grow: false };