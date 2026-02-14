import PrimaryButton from "@/app/components/buttons/primary";
import Container from "@/app/components/container";
import Image from "next/image";
import Link from "next/link";
import { FaDownload } from "react-icons/fa6";

// DATA
const data = {

    title: "Our App",
    description: "Download Codify App for coding resources, notes, courses, and internships. Collaborate with a built-in code editor and boost your skills—all in one app!",
    curv1: "/images/curve-1.svg",
    curv2: "/images/curve-2.svg",
    button_text: "Download",
    button_link: "/",
    app_img: "/images/app-2.png",

}

export default function OurApp(){

    return (

        <section className="relative py-8 sm:py-16 lg:py-24 bg-dark overflow-hidden min-h-dvh">
            <div className="hidden absolute top-0 left-7.5 right-7.5 h-[1px] bg-neutral-600/25 undefined pointer-events-none lg:block xl:left-10 right-10"></div>
            <div className="hidden absolute top-0 left-5 w-[1px] h-full bg-neutral-600/25 pointer-events-none md:block lg:left-7.5 xl:left-10"></div>
            <div className="hidden absolute top-0 right-5 w-[1px] h-full bg-neutral-600/25 pointer-events-none md:block lg:right-7.5 xl:right-10"></div>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col justify-between gap-10">
                        <h2 className="relative text-5xl md:text-7xl lg:text-[200px] tracking-wide font-bebas text-light">
                            { data.title }
                            <span className="hidden lg:block absolute bottom-10 right-0 max-w-[12%] w-full h-2 bg-light"></span>
                        </h2>
                        <div className="flex gap-6 items-end">
                            <div className="w-full">
                                <Link href={ data.button_link }>
                                    <PrimaryButton>{ data.button_text }<FaDownload color="white" size={ 16 } /></PrimaryButton>
                                </Link>
                            </div>
                            <Image 
                                src={ data.curv1 }
                                alt=""
                                width={ 500 }
                                height={ 500 }
                                className="hidden lg:block w-[80%] pb-7"
                            />
                        </div>
                        <p className="text-lg text-light font-syne max-w-96">{ data.description }</p>
                    </div>
                    <div className="relative px-16">
                        <Image 
                            src={ data.app_img }
                            alt=""
                            width={ 1000 }
                            height={ 1000 }
                            className="max-w-[300px]"
                        />
                        <Image 
                            src={ data.curv2 }
                            alt=""
                            width={ 500 }
                            height={ 500 }
                            className="hidden lg:block absolute bottom-0 -right-20 max-w-80 pb-7"
                        />
                    </div>
                </div>
            </Container>
        </section>

    )

}
