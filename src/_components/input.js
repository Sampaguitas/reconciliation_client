import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Input extends Component{
    constructor(props) {
        super(props);
        this.state = { show: false }
        this.togglePassword = this.togglePassword.bind(this);
    }

    togglePassword(event) {
        event.preventDefault();
        const { show } = this.state;
        this.setState({show: !show });
    }

    render() {
        const { show } = this.state;
        const { inline, submitted, required, value, name, title, type, onChange, placeholder, disabled, autoComplete} = this.props;
        return(
            <div className={'form-group' + (inline ? ' row' : '') + (submitted && required && !value ? ' has-error' : '')}>
                <label htmlFor={name} className={inline ? "col-sm-2 col-form-label" : ''}>{title}</label>
                <div className={inline ? "col-sm-10" : ''}>
                    <div className="input-group input-group-lg input-group-sm">
                        <input
                            className="form-control"
                            id={name}
                            name={name}
                            type={show ? 'text' : type}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            autoComplete={autoComplete}
                        />
                        {type === 'password' &&
                            <div className="input-group-append">
                                <div type="button" className="input-group-text" onClick={event => this.togglePassword(event)}>
                                    <FontAwesomeIcon icon={show ? "eye-slash" : "eye" }/>
                                </div>
                            </div>
                        }
                    </div>
                    {submitted && !value && required &&
                        <div className="help-block">{title} is required</div>
                    }
                </div>
            </div>
        );
    }
}

export default Input;