import { useState } from "react";
import { executeCode } from "../../api";
import { BsFillTriangleFill } from "react-icons/bs";

const EditorOutput = ({ editorRef, language }) => {

    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const runCode = async () => {

        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;
        try {

            setIsLoading(true);
            const { run: result } = await executeCode(language, sourceCode);
            setOutput(result.output.split("\n"));
            result.stderr ? setIsError(true) : setIsError(false);

        } catch (error) {

            console.log(error);
            alert("An error occurred: " + (error.message || "Unable to run code"));

        } finally {

            setIsLoading(false);

        }

    };

    return (

        <div className="w-full flex flex-col gap-3 mt-1">
            <div className="flex items-end justify-between gap-4">
                <button
                    className={`flex items-center gap-2 px-4 py-2 w-fit rounded-lg ${
                        isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                    } text-white text-sm font-medium font-sora transition`}
                    disabled={isLoading}
                    onClick={runCode}
                >
                    {
                    
                        isLoading ? "Running..." : "Run Code"
                    
                    }
                    {
                    
                        isLoading ? null : <span className="text-white rotate-90 text-xs"><BsFillTriangleFill /></span>
                    
                    }
                </button>
                <h4 className="text-lg font-apercu font-medium text-white mr-2">Output</h4>
            </div>
            <div
                className={`h-full p-4 text-sm overflow-auto border rounded-lg ${
                    isError ? "border-red-500 text-red-400" : "border-gray-800 text-gray-300"
                } bg-white/5`}
            >
                {output
                    ? output.map((line, i) => <p key={i}>{line}</p>)
                    : 'Click "Run Code" to see the output here'}
            </div>
        </div>

    );

};
export default EditorOutput;
