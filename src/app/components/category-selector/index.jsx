import { useState, useEffect, useRef } from "react";
import { FaAngleDown } from "react-icons/fa6";

export default function CategorySelector({ categories, selectedCategory, onSelect }) {

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

                setIsOpen(false);

            }

        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {

            document.removeEventListener("mousedown", handleClickOutside);

        };

    }, []);

    return (
        <div className="" ref={dropdownRef}>
            <div className="relative flex justify-end">
                <button
                    className="flex items-center gap-2 rounded-lg border-2 border-white/10 bg-accent text-white text-sm font-medium font-sora pl-5 pr-4 py-3 hover:bg-orange-500 duration-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedCategory}
                    <span className="text-white">
                        <FaAngleDown />
                    </span>
                </button>
                {
                
                    <div
                        className={`absolute top-full right-0 mt-2 shadow-lg bg-white border border-gray-100 rounded-lg px-2 py-2 flex flex-col gap-1 min-w-64 z-10 transition-all duration-300 overflow-hidden ${
                            isOpen ? "max-h-dvh opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <ul className="flex flex-col gap-1">
                            {
                                categories.map((category) => (

                                    <li
                                        key={category}
                                        className={`flex items-center justify-between w-full px-4 py-2 hover:bg-neutral-200 duration-300 cursor-pointer rounded-md font-medium font-sora text-sm ${
                                        category === selectedCategory ? "bg-neutral-800/80 text-white" : ""}`}
                                        onClick={() => {

                                            onSelect(category);
                                            setIsOpen(false);

                                        }}
                                    >
                                        { category }
                                    </li>

                                ))
                            
                            }
                        </ul>
                    </div>

                }
            </div>
        </div>

    );

};
