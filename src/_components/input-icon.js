import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// const InputIcon = (props) => (
class InputIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.togglePassword = this.togglePassword.bind(this);
    }

    togglePassword(event) {
        event.preventDefault();
        const { show } = this.state;
        this.setState({show: !show });
    }

    render() {
        const { show } = this.state;
        const {submitted, value, icon, name, type, onChange, placeholder, autoComplete, title} = this.props;
        return (
            <div className={'form-group' + (submitted && !value ? ' has-error' : '')}>
                <div className="input-group input-group-lg">
                    <div className="input-group-prepend">
                        <div className="input-group-text">
                            <FontAwesomeIcon icon={icon} />
                        </div>
                    </div>
                    <input
                        className="form-control"
                        name={name}
                        type={show ? 'text' : type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        required
                    />
                    {type === 'password' &&
                        <div className="input-group-append">
                            <div type="button" className="input-group-text" onClick={event => this.togglePassword(event)}>
                                <FontAwesomeIcon icon={show ? "eye-slash" : "eye" }/>
                            </div>
                        </div>
                    }
                </div>
                {submitted && !value &&
                    <div className="help-block">{title} is required</div>
                }
            </div>
        );
        
    }
};

export default InputIcon;