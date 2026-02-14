// IMPORT REACT ICONS
import Link from "next/link"
import { FaLinkedinIn, FaSquareInstagram, FaGithub } from "react-icons/fa6"
import { IoMdMail } from "react-icons/io"

const links = [

	{
		icon: <FaSquareInstagram />,
		link: "https://www.instagram.com/codifyclub/",
		color: "bg-pink-500",
	},
	{
		icon: <FaLinkedinIn />,
		link: "/",
		color: "bg-blue-500",
	},
	{
		icon: <FaGithub />,
		link: "/",
		color: "bg-black",
	},
	{
		icon: <IoMdMail />,
		link: "/",
		color: "bg-red-400",
	},

]

export default function AboutSocials() {
	
    return (

		<div className="flex gap-6">
			{

				links.map(( data, index ) => (

					<Link key={index} href={data.link} target="blank">
						<div className={`outline outline-2 outline-dark outline-offset-2 md:outline-offset-4 rounded-full size-8 md:size-10 flex items-center justify-center group hover:bg-dark duration-300`}>
							<span className={`group-hover:text-white duration-300 text-xl`}>{ data.icon }</span>
						</div>
					</Link>

				))

			}
		</div>

    )

}
