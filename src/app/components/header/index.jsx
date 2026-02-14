'use client'
import styles from './style.module.scss'
import { useEffect, useState } from 'react';
import Nav from './nav';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {

    const [isActive, setIsActive] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();

    useEffect( () => {

      	if(isActive) setIsActive(false)

    }, [pathname])

	// Handle scroll direction for header visibility
    useEffect(() => {

        const handleScroll = () => {

            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 0) {

                setIsVisible(false); // Hide header when scrolling down

            } else {

                setIsVisible(true); // Show header when scrolling up

            }

            setLastScrollY(currentScrollY);

        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);

    }, [lastScrollY]);

    return (

		<header>
			<div className={`fixed top-0 right-0 flex items-center justify-between w-full z-50 p-4 transition-trasnform duration-300 ${ isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0" }`}>
				<Link href="/">
					<Image
						className={`w-11 z-30`}
						src={ pathname === "/code-editor" ? "/logos/codify-c-white.png" : "/logos/codify-c-black.png" }
						width={100}
						height={50}
						alt="logo"
					/>
				</Link>
				<div className="flex gap-4 items-center">
					<SignedOut>
						<SignInButton mode='modal' className="px-5 py-3 text-sm rounded-full bg-neutral-500/50 backdrop-blur-sm text-white font-sora font-medium "/>
					</SignedOut>
					<SignedIn>
						<UserButton 
							appearance={{
								elements: {
									userButtonAvatarBox: "rounded-full border border-gray-500 size-10"
								}
							}} 
						/>
					</SignedIn>
					<div onClick={() => {setIsActive(!isActive)}} className={`size-12 flex items-center justify-center cursor-pointer rounded-full ${isActive ? "bg-white" : "bg-accent"}`}>
						<div className={`${styles.burger} ${isActive ? styles.burgerActive : ""}`}></div>
					</div>
				</div>
			</div>
			<AnimatePresence mode="wait">
				{isActive && <Nav />}
			</AnimatePresence>
		</header>

    )

}
