'use client'
// SWIPER IMPORT 
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/bundle"
import "swiper/css/autoplay"

// Import Swiper modules
import { Autoplay } from "swiper/modules"

import Image from "next/image"


export default function HeroSlider({ sliderData }){

    return (

        <div className="h-full md:aspect-video relative overflow-hidden">
            <div className="absolute top-1 left-1 md:top-4 md:left-4 z-20 rounded-full bg-accent px-4 md:px-6 py-1 md:py-2 cursor-default">
                <span className="text-white text-xs md:text-lg md:font-medium">Upcoming</span>
            </div>
            <Swiper 
                className="mySwiper"
                loop={true}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
            >
                {

                    sliderData.map( ( item, index ) => (

                        <SwiperSlide key={index}>
                            <div className="w-full h-full">
                                <Image 
                                    src={item.src}
                                    alt={item.alt}
                                    width={1000}
                                    height={1000}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>

                    ))

                }
            </Swiper>
        </div>

    )

}
