import React, { Component } from 'react';
import { TypeToString, getDateFormat } from '../../_functions';

class TableData extends Component{
    render() {
        const { colIndex, value, type, align, settingsColWidth, handleClick, eventId} = this.props
        return (
            <td
              style={{
                width: 'auto',
                whiteSpace: 'nowrap',
                paddingLeft: '5px',
                textOverflow: 'ellipsis',
                textAlign: align || 'left',
                overflow: 'hidden',
                minWidth: _.isUndefined(settingsColWidth) || !settingsColWidth.hasOwnProperty(colIndex) ? 0 : (!!settingsColWidth[colIndex] ? `${settingsColWidth[colIndex]}px` : '10px'),
                maxWidth: _.isUndefined(settingsColWidth) || !settingsColWidth.hasOwnProperty(colIndex) ? 'none' : (!!settingsColWidth[colIndex] ? `${settingsColWidth[colIndex]}px` : '35px')
              }}
              onClick={event => !!handleClick && !!eventId ? handleClick(event, eventId) : event.preventDefault()}
            >
              {TypeToString(value, type, getDateFormat())}
            </td>
        );
    }
}

export default TableData;