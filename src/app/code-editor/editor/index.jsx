"use client";

import { useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./language-selector";
import { CODE_SNIPPETS } from "@/app/code-editor/EditorData";
import EditorOutput from "./editor-output";

const MainEditor = () => {
    const editorRef = useRef();
    const [value, setValue] = useState("");
    const [language, setLanguage] = useState("javascript");

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language) => {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
                <LanguageSelector language={language} onSelect={onSelect} />
                <div className="rounded-lg overflow-hidden">
                    <Editor
                        options={{
                            minimap: {
                                enabled: false,
                            },
                        }}
                        height="75vh"
                        theme="vs-dark" // Default dark theme
                        language={language}
                        defaultValue={CODE_SNIPPETS[language]}
                        onMount={onMount}
                        value={value}
                        onChange={(value) => setValue(value)}
                    />
                </div>
            </div>
            <EditorOutput editorRef={editorRef} language={language} />
        </div>
    );
};

export default MainEditor;
