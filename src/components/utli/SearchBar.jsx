import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ placeholder, onSearch, onClick, onClear, products, showSuggestions = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter products based on search term
  useEffect(() => {
    if (showSuggestions && products && searchTerm.trim().length > 0) {
      const filtered = products
        .filter((product) => {
          const name = product.name?.toLowerCase() || "";
          const saleCode = product.saleCode?.toLowerCase() || "";
          const search = searchTerm.toLowerCase();
          return name.includes(search) || saleCode.includes(search);
        })
        .slice(0, 10); // Limit to 10 suggestions
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products, showSuggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If search is cleared, reset to show all products
    if (value.trim() === "" && onClear) {
      onClear();
    }
    // Don't call onSearch here - only update when user clicks suggestion or submits
  };

  const handleClick = () => {
    if (onClick) {
      onClick(searchTerm);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(searchTerm);
    }
    setShowDropdown(false);
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowDropdown(false);
    if (onClick) {
      onClick(product.name);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && searchTerm.trim().length > 0 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full`}>
      <div
        className={`
        relative flex items-center w-full
        bg-white border rounded-lg shadow-sm transition-all duration-200
        ${
          isFocused
            ? "border-orange-300 ring-2 ring-orange-100 shadow-md"
            : "border-gray-300 hover:border-gray-400"
        }
      `}
      >
        {/* Search Icon */}
        <div
          className={`absolute left-3 items-center pointer-events-none ${
            isFocused ? "hidden" : "flex"
          }`}
        >
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            w-full  py-3 text-sm text-gray-900 placeholder-gray-500
            bg-transparent border-none rounded-lg focus:outline-none
            ${isFocused ? "pl-3" : "pl-10"}
          `}
        />

        {/* Clear/Search Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClick}
            className={`
              absolute right-3 flex items-center justify-center
              w-5 h-5 text-gray-400 hover:text-gray-600
              transition-colors duration-200
            `}
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((product) => (
            <button
              key={product._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSuggestionClick(product);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
            >
              <div className="font-medium">{product.name}</div>
              {product.saleCode && (
                <div className="text-xs text-gray-500">Code: {product.saleCode}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
