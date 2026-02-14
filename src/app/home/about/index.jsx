import PrimaryButtonDark from "@/app/components/buttons/primary/primary-dark";
import Container from "@/app/components/container";
import Image from "next/image";
import Link from "next/link";
import AboutSocials from "./socials";

// DATA
const data = {

    button_link: "/",
    button_text: "Learn More",
    heading: "About Us",
    description: "Welcome to Codify Club — where opportunity meets innovation! We're a community of passionate coders, creators, and problem-solvers. Whether you're hunting for your next internship, looking to ace college exams, or eager to elevate your coding skills, Codify is your all-in-one platform for success.",

}

export default function About(){

    return (

        <section className="relative py-10 sm:py-16 lg:pt-20 lg:pb-32 bg-light">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
                    <div className="relative">
                        <div className="w-full h-full pr-10 md:pr-36 overflow-hidden">
                            <Image 
                                src="/images/about/tree.jpg"
                                alt=""
                                width={1000}
                                height={1000}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="absolute bottom-[10%] right-0 max-w-44 md:max-w-56 overflow-hidden">
                            <Image 
                                src="/images/about/people.jpg"
                                alt=""
                                width={1000}
                                height={1000}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 md:gap-20">
                        <div className="flex flex-col gap-4">
                            <h2 className="relative text-5xl md:text-7xl lg:text-[200px] tracking-wide font-bebas lg:text-right">
                                { data.heading }
                                <span className="hidden lg:block absolute bottom-10 left-0 max-w-[70%] w-full h-2 bg-black"></span>
                            </h2>
                            <p className="text-lg font-syne">{ data.description }</p>
                        </div>
                        <div className="flex flex-col-reverse md:flex-row md:items-center gap-6">
                            <Link href={ data.button_link }>
                                <PrimaryButtonDark>{ data.button_text }</PrimaryButtonDark>
                            </Link>
                            <AboutSocials />
                        </div>
                    </div>
                </div>
            </Container>
        </section>

    )

}
