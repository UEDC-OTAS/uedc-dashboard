import { useEffect, useState } from "react";

const MobileBlocker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800); // 768px is a common threshold for mobile devices
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Update on window resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="font-bold text-2xl mb-5">Mobile Access Blocked</h1>
        <p className="font-medium font-wrap">
          This website is not available on mobile devices. Please access it from
          a desktop or laptop.
        </p>
      </div>
    );
  }

  return children;
};

import PropTypes from "prop-types";

MobileBlocker.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MobileBlocker;
