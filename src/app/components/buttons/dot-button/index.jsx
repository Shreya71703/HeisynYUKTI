export default function DotButton({ children, ...props }) {

    return (

        <button { ...props } className="flex items-center gap-2 md:gap-3 md:px-5 px-4 py-2 border-2 border-neutral-800 rounded-full font-medium text-sm md:text-base text-nowrap">
            <span className="bg-neutral-700 rounded-full size-[4px] md:size-[6px]"></span>
            { children }
        </button>

    )

}
