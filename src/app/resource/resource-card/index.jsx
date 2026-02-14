import { FaDownload } from "react-icons/fa6"
import Image from "next/image"

export default function ResourceCard({ src, title, path }){

    return (

        <div className="bg-white shadow-md rounded-xl p-2 flex flex-col gap-4">
            <div className="aspect-[5/4] overflow-hidden w-full rounded-lg">
                <Image 
                    src={ src }
                    alt={ src }
                    width={ 1000 }
                    height={ 1000 }
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex items-center gap-4 px-2">
                <h4 className="text-lg font-sora font-semibold">{ title }</h4>
                <a href={ path } download>
                    <button className="p-3 rounded-full border-2 border-neutral-800 hover:bg-accent duration-300 text-sm group font-medium">
                        <span className=" text-black group-hover:text-white duration-150"><FaDownload /></span>
                    </button>
                </a>
            </div>
        </div>

    )

}
