import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBox.css';

const SearchBox = ({ placeholder, value, onChange }) => {
    return (
        <div className="search-box">
            <FaSearch className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {value && (
                <button
                    className="clear-button"
                    onClick={() => onChange({ target: { value: '' } })}
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default SearchBox;