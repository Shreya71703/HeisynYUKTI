import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { menuSlide } from '../anim';
import Link from './Link';
import Curve from './Curve';
import Footer from './Footer';

const navItems = [
	{
		title: "Home",
		href: "/",
	},
	{
		title: "Resources",
		href: "/resource",
	},
	{
		title: "Code Editor",
		href: "/code-editor",
	},
	{
		title: "Lounge",
		href: "/lounge",
	},
	{
		title: "Career",
		href: "/career",
	},
	{
		title: "Guide Barter",
		href: "https://codifyguidebarter.netlify.app",
	},
	{
		title: "Founders",
		href: "/founders",
	},
]

export default function Navbar() {

	const pathname = usePathname();
	const [selectedIndicator, setSelectedIndicator] = useState(pathname);

	return (

		<motion.div variants={menuSlide} initial="initial" animate="enter" exit="exit" className="h-dvh z-40 bg-dark fixed right-0 top-0 max-w-[360px] w-full">
			<div className="box-border h-full px-12 py-12 flex flex-col justify-between">
				<div onMouseLeave={() => {setSelectedIndicator(pathname)}} className="flex flex-col gap-4 text-3xl text-white py-4 mt-4">
					<div className="border-b-[1px] border-gray-100">
						<p className="text-xs uppercase text-gray-300">Navigation</p>
					</div>
					{

						navItems.map( (data, index) => {

							return <Link key={index} data={{...data, index}} isActive={selectedIndicator == data.href} setSelectedIndicator={setSelectedIndicator}></Link>

						})

					}
				</div>
				<Footer />
			</div>
			<Curve />
		</motion.div>

	)
	
}
