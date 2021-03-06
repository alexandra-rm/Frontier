import React, { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/core';

type Props = {
    value: number;
    maxValue: number;
    title: string;
    color?: string;
};
const BarItemHover = css({
    fontWeight: 'bold',
    cursor: 'pointer',
});
export const BarItem = styled.div((props: { height: number; color: string | undefined }) => ({
    flexGrow: 1,
    width: '100%',
    height: props.height + '%',
    backgroundColor: props.color === undefined ? '#f05326' : props.color,
    maxWidth: '25px',
    margin: '0 2px',
    position: 'relative',
    '&:hover,&:focus': BarItemHover,
}));
const BarTitle = styled.div`
    position: absolute;
    bottom: -80px;
    left: -20px;
    width: 100%;
    text-align: center;
    transform: rotate(-70deg);
    white-space: nowrap;
`;
const BarValue = styled.div`
    position: absolute;
    top: -25px;
    width: 100%;
    text-align: center;
    transform: rotate(-70deg);
    white-space: nowrap;
`;
export const Bar: FunctionComponent<Props> = ({ value, maxValue, title, color }) => {
    const fullness = (value / maxValue) * 100;
    return (
        <BarItem color={color} height={fullness}>
            <BarTitle>{title}</BarTitle>
            <BarValue>{value}</BarValue>
        </BarItem>
    );
};
