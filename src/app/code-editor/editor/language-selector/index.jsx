import { useState, useEffect, useRef } from "react";
import { LANGUAGE_VERSIONS } from "@/app/code-editor/EditorData";
import { FaAngleDown } from "react-icons/fa6";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }) => {

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
            <div className="relative">
                <button
                    className="flex items-center gap-2 rounded-lg border-2 border-white/10 bg-white/5 text-white text-sm font-medium font-sora pl-5 pr-4 py-2 hover:bg-white/20 duration-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {language}
                    <span className="text-white"><FaAngleDown /></span>
                </button>
                {
                
                    isOpen && (

                        <ul className="absolute top-full -left-4 mt-2 shadow-lg bg-dark border border-gray-800 rounded-lg px-2 py-2 flex flex-col gap-1 min-w-64 z-10">
                            {
                            
                                languages.map(([lang, version]) => (

                                    <li
                                        key={lang}
                                        className={`flex items-center justify-between w-full px-4 py-2 hover:bg-white/40 duration-300 cursor-pointer rounded-md font-medium font-sora text-sm ${
                                            lang === language ? "bg-white/80 text-black" : "text-white"
                                        }`}
                                        onClick={() => {
                                            onSelect(lang);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {lang}
                                        &nbsp;
                                        <span className="text-xs text-neutral-400">
                                            ({version})
                                        </span>
                                    </li>
                                    
                                ))
                            
                            }
                        </ul>

                    )

                }
            </div>
        </div>
    );
};

export default LanguageSelector;
