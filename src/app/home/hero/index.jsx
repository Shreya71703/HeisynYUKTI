import Link from "next/link"
import Container from "@/app/components/container"
import Rings from "./rings"
import ScrollDown from "./scroll-down"
import DotButton from "@/app/components/buttons/dot-button"
import DotButtonDark from "@/app/components/buttons/dot-button-dark"
import HeroSlider from "./hero-slider"

const data = {

    subtitle: "Codify Club,",
    title: "Learn. Innovate. Succeed.",
    button_one_link: "/lounge",
    button_one_text: "Lounge",
    button_two_link: "/career",
    button_two_text: "Career",
    button_three_link: "/resource",
    button_three_text: "Resources",

}

const heroList = [

    {
        item: "Engaging Community",
    },
    {
        item: "Learning platform",
    },
    {
        item: "Events like Hackathons, Tech fiestas",
    },
    {
        item: "Career opportunities",
    },

]

const sliderData = [

    {
        src: "/images/hero-slider/slide-1.jpg",
        alt: "Slide Image",
    },
    {
        src: "/images/hero-slider/slide-2.jpg",
        alt: "Slide Image",
    },
    {
        src: "/images/hero-slider/slide-3.jpg",
        alt: "Slide Image",
    },

]

export default function Hero(){

    return (

        <section className="relative pb-10 pt-20 md:py-20 bg-light overflow-hidden">
            <Rings />
            <div className="absolute top-[25%] md:top-[31%] right-10 md:right-16 z-10"><ScrollDown /></div>
            <div className="pt-10 flex flex-col gap-6">
                <div className="space-y-4 z-10">
                    <h3 className="text-center font-sora text-xl">{ data.subtitle }</h3>
                    <h1 className="text-5xl md:text-6xl lg:text-[140px] tracking-wide text-center text-neutral-900 font-bebas uppercase z-10">{ data.title }</h1>
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                        <Link href={ data.button_one_link }>
                            <DotButton>{ data.button_one_text }</DotButton>
                        </Link>
                        <Link href={ data.button_two_link }>
                            <DotButton>{ data.button_two_text }</DotButton>
                        </Link>
                        <Link href={ data.button_three_link }>
                            <DotButtonDark>{ data.button_three_text }</DotButtonDark>
                        </Link>
                    </div>
                </div>
                <div className="mx-4 py-6 md:p-10 flex items-center justify-center bg-dark rounded-xl">
                    <Container>
                        <div className="relative flex flex-col gap-6 md:gap-10 py-8 lg:py-12 lg:px-32">
                            <HeroSlider sliderData={ sliderData } />
                            <ul className="list-disc list-inside space-y-2">
                                {

                                    heroList.map( ( data, index ) => (

                                        <li key={ index } className="text-sm text-neutral-300 uppercase font-syne font-bold">{ data.item }</li>

                                    ))

                                }
                            </ul>
                        </div>    
                    </Container>
                </div>
            </div>
        </section>

    )

}
