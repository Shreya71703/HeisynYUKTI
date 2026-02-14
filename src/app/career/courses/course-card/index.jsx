import Image from "next/image"
import Link from "next/link"
import { FaStar, FaStarHalfAlt } from "react-icons/fa"

export default function CourseCard({ title, src, auther, price, discount_price, rating }) {

    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (

        <div className="bg-white shadow-md rounded-xl p-2 flex flex-col gap-4">
            <div className="aspect-video overflow-hidden w-full rounded-lg">
                <Image 
                    src={ src }
                    alt={ src }
                    width={ 1000 }
                    height={ 1000 }
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="relative flex flex-col gap-[2px] px-2">
                <h4 className="text-lg font-sora font-semibold">{ title }</h4>
                <p className="text-sm text-neutral-600 font-sora font-medium">{ auther }</p>
                <div className="flex items-center gap-2">
                    <p className="font-medium">{ rating.toFixed(1) }</p>
                    <div className="flex items-center gap-[2px]">
                        {
                    
                            Array(fullStars).fill(0).map((_, index) => (

                                <span key={ index } className="text-sm text-orange-400"><FaStar /></span>

                            ))

                        }
                        {
                            
                            hasHalfStar && <span className="text-sm text-orange-400"><FaStarHalfAlt /></span>

                        }
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-lg font-medium font-sora">{ discount_price }</p>
                    <p className="text-lg text-neutral-500 line-through">{ price }</p>
                </div>
                <Link href="">
                    <button className="absolute bottom-1 right-1 px-5 py-2 rounded-full bg-accent hover:bg-orange-500 duration-300 text-sm text-white font-medium">
                        Buy Now
                    </button>
                </Link>
            </div>
        </div>

    )

}
