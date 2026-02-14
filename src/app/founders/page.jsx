import Container from '../components/container';
import Image from 'next/image';

// IMPORT ABOUT FOUNDER COMPONENT
import ImageParallax from './image-parallax';
import AboutFounders from './about-founders';

export default function Founders() {

	const mainPic = '/public/images/founders/main.webp'

    return (

		<section className="flex flex-col pt-24 bg-dark">
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-14 bg-[url('/images/hero-background.jpg')] bg-no-repeat bg-cover bg-center">
                <div className="absolute top-28 left-32">
                    <Image 
                        alt='arrow'
                        className="hidden md:block md:w-28 lg:w-40 scale-x-[-1]"
                        width={100}
                        height={0}
                        src="/icons/curved-arrow.svg"
                    />
                </div>
                <div className="flex justify-end gap-2 px-4">
                    <div className="mb-[6px] md:mb-4 border-b-4 lg:border-b-8 border-white w-6 md:w-16 lg:w-20"></div>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[180px] text-white font-apercu font-medium">Founders.</h1>
                </div>
                <ImageParallax />
            </div>
            <div className="bg-white">
                <Container>
                    <div className="flex flex-col justify-center gap-6 py-4">
                        <div className="md:hidden">
                            <Image
                                src={mainPic}
                                alt="mainpic"
                                width={1000}
                                height={800}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="py-6">
                            <AboutFounders />
                        </div>
                    </div>
                </Container>
            </div>
		</section>

    )

}
