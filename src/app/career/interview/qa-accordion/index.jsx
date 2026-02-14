import { useState } from "react"
import { FaAngleDown, FaAngleUp } from "react-icons/fa"

export default function QAAccordion({ title, onSubmit, rating }){

    const [isAccordionOpen, setIsAccordionOpen] = useState(false)
    const [answer, setAnswer] = useState("")

    const handleSubmit = () => {

        if (onSubmit) {

            onSubmit(answer); // Call parent function to submit answer

        }

    }

    return (

        <div className="flex flex-col py-2 border-b-2 border-neutral-200">
            <div className="flex items-center gap-6 py-4 justify-between cursor-pointer" onClick={ () => setIsAccordionOpen(!isAccordionOpen) }>
                <p className="text-lg md:text-xl font-medium font-sora">{ title }</p>
                <span>
                    {

                        isAccordionOpen ? <FaAngleUp /> : <FaAngleDown />

                    }
                </span>
            </div>
            <div className={`w-full flex flex-col gap-6 pb-2 duration-150 ${ isAccordionOpen ? "" : "hidden" }`}>
                <textarea 
                    value={ answer }
                    onChange={ (e) => setAnswer(e.target.value) }
                    rows={ 5 } 
                    className="p-2 w-full resize-none rounded-lg border-2 border-neutral-200" 
                    placeholder="Write your answer here"
                ></textarea>
                <div className="flex items-center gap-6">
                    <button className="px-4 py-2 bg-green-400 rounded-full text-white font-medium font-sora" onClick={ handleSubmit }>Submit</button>
                </div>
                {
                
                    rating !== undefined && (

                        <p className="text-lg font-semibold text-green-500">Marks: { rating } / 10</p>

                    )
                
                }
            </div>
        </div>

    )

}
