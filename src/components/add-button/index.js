import React from 'react';
import {ContentPanelHeaderButton, ContentPanelHeaderButtonIcon} from '../content-panel';
import FlexBox from '../flexbox';
import { VscAdd } from 'react-icons/vsc';

function AddValueButton(props) {

    let {onClick, label} = props;
    
    if (!label) {
        label = "Add value"
    }

    return (
        <FlexBox>
            <ContentPanelHeaderButton className="add-panel-btn" onClick={onClick}>
                <ContentPanelHeaderButtonIcon>
                    <VscAdd/>
                </ContentPanelHeaderButtonIcon>
                {label}
            </ContentPanelHeaderButton>
        </FlexBox>
    )
}

export default AddValueButton;