export default function PrimaryButtonDark ({ children, ...props }){

    return (

        <button { ...props } className="relative items-center justify-start inline-block px-6 py-3 lg:px-8 lg:py-4 lg:text-lg overflow-hidden font-medium font-sora rounded-full group">
            <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-black opacity-[3%]"></span>
            <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-black opacity-100 group-hover:-translate-x-8"></span>
            <span className="relative w-full text-black transition-colors duration-200 ease-in-out group-hover:text-white flex items-center gap-2">{ children }</span>
            <span className="absolute inset-0 border-2 border-black rounded-full"></span>
        </button>

    )

}
