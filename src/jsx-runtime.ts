// Custom JSX runtime to ensure _jsxDEV is available
import React from 'react';

export const jsx = React.createElement;
export const jsxs = React.createElement;
export const jsxDEV = React.createElement;
export const Fragment = React.Fragment;
