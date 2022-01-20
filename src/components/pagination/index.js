import React from 'react';
import './style.css';
import FlexBox from '../flexbox';
import {BsChevronBarLeft, BsChevronBarRight, BsChevronLeft, BsChevronRight} from 'react-icons/bs'

function Pagination(props) {

    let {pageInfo, updatePage} = props;
    

    return(
        <FlexBox className="pagination-container auto-margin" style={{}}>
            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('first')
            }}>
                <BsChevronBarLeft className={'active'} />
            </FlexBox>
            
            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('prev')
            }}>
                <BsChevronLeft className={'active'} />
            </FlexBox>

            <FlexBox className={'pagination-btn'} style={{ maxWidth: "24px" }} onClick={() => {
                updatePage('next')
            }}>
                <BsChevronRight className={'active'} />
            </FlexBox>

            <FlexBox className={'pagination-btn'} onClick={() => {
                updatePage('last')
            }}>
                <BsChevronBarRight className={'active'} />
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