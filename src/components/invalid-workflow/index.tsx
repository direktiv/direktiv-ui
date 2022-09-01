import React from 'react';
import FlexBox from '../flexbox';

export interface InvalidWorkflowProps {
    invalidWorkflow?: string | null
}

function InvalidWorkflow({ invalidWorkflow }: InvalidWorkflowProps) {
    return (
        <>
            {invalidWorkflow ?
                <FlexBox className="col center-y" style={{ padding: "0px 50px" }}>
                    <h3 style={{ marginBottom: "0px" }}>Invalid Workflow</h3>
                    <pre style={{ whiteSpace: "break-spaces" }}>
                        {invalidWorkflow}
                    </pre>
                </FlexBox>
                : <></>}
        </>
    );
}

export default InvalidWorkflow;