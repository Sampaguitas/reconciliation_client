import React, { Component } from 'react';
import { arraySorted } from '../_functions';

class Select extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        const { inline, value, options, optionText, name, title, onChange, disabled} = this.props;
        return(
            <div className={'form-group' + (inline ? ' row' : '')}>
                <label htmlFor={name} className={inline ? "col-sm-2 col-form-label" : ''}>{title}</label>
                <div className={inline ? "col-sm-10" : ''}>
                    <div className="input-group input-group-lg input-group-sm">
                        <select
                            className="form-control"
                            id={name}
                            name={name}
                            value={value}
                            onChange={onChange}
                            disabled={disabled}
                        >
                            {options && arraySorted(options, optionText).map(option => {
                                return (
                                    <option
                                        key={option._id}
                                        value={option._id}>{option[optionText]}
                                    </option>                                   
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}

export default Select;