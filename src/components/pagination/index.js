import React from 'react';
import './style.css';
import FlexBox from '../flexbox';
import {BsChevronBarLeft, BsChevronBarRight, BsChevronLeft, BsChevronRight} from 'react-icons/bs'

function Pagination(props) {

    let {pageInfo, updatePage} = props;
    
    const hasNext = pageInfo?.hasNextPage? 'arrow active': 'arrow'
    const hasPrev = pageInfo?.hasNextPreviousPage? 'arrow active': 'arrow'
    return(
        <FlexBox style={{justifyContent: "flex-end"}}>
        <FlexBox className="pagination-container" style={{}}>
            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('first')
            }}>
                <BsChevronBarLeft className={'arrow active'} />
            </FlexBox>
            
            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('prev')
            }}>
                <BsChevronLeft className={hasPrev} />
            </FlexBox>
            <FlexBox style={{width: "40px"}}>

            </FlexBox>
            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('next')
            }}>
                <BsChevronRight className={hasNext} />
            </FlexBox>

            <FlexBox className={'pagination-btn'} onClick={() => {
                updatePage('last')
            }}>
                <BsChevronBarRight className={'arrow active'} />
            </FlexBox>
        </FlexBox>
        </FlexBox>
    )
}

export default Pagination;

function PaginationButton(props) {

    let {label, onClick, currentIndex} = props;
    let classes = "pagination-btn auto-margin";
    if (!onClick) {
        classes += " disabled"
    }

    if (currentIndex) {
        classes += " active-pagination-btn"
    }

    return(
        <FlexBox className={classes} onClick={onClick}>
            <div style={{textAlign: "center"}}>
                {label}
            </div>
        </FlexBox>
    )
}