'use client';

import { useState } from 'react';
import FounderProject from './projects';
import FounderModal from './modal';

import { FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa6"

const iconMap = {
    FaLinkedinIn: <FaLinkedinIn />,
    FaGithub: <FaGithub />,
    FaInstagram: <FaInstagram />,
}

const projects = [
    {
        title: "Shiva Pandey",
        src: "shiva.webp",
        color: "#000000",
        mainLink: "https://shiva-pandey.netlify.app/",
        links: [

            {
                icon: "FaLinkedinIn",
                link: "/",
            },
            {
                icon: "FaGithub",
                link: "/",
            },
            {
                icon: "FaInstagram",
                link: "/",
            },

        ],
    },
    {
        title: "Sanskar Dubey",
        src: "sanskar.jpg",
        color: "#8C8C8C",
        mainLink: "https://www.linkedin.com/in/sanskardev/",
        links: [

            {
                icon: "FaLinkedinIn",
                link: "/",
            },
            {
                icon: "FaGithub",
                link: "/",
            },
            {
                icon: "FaInstagram",
                link: "/",
            },

        ],
    },
    {
        title: "Zaid Sayyed",
        src: "zaid.jpeg",
        color: "#EFE8D3",
        mainLink: "https://www.linkedin.com/in/zaid-sayyed/",
        links: [

            {
                icon: "FaLinkedinIn",
                link: "/",
            },
            {
                icon: "FaGithub",
                link: "/",
            },
            {
                icon: "FaInstagram",
                link: "/",
            },

        ],
    },
    {
        title: "Devendra Singh",
        src: "devendra.jpeg",
        color: "#706D63",
        mainLink: "https://www.linkedin.com/in/geekydev/",
        links: [

            {
                icon: "FaLinkedinIn",
                link: "/",
            },
            {
                icon: "FaGithub",
                link: "/",
            },
            {
                icon: "FaInstagram",
                link: "/",
            },

        ],
    },
    {
        title: "Indrakshi",
        src: "indrakshi.jpeg",
        color: "#706D63",
        mainLink: "https://www.linkedin.com/in/-indrakshi-/",
        links: [

            {
                icon: "FaLinkedinIn",
                link: "/",
            },
            {
                icon: "FaGithub",
                link: "/",
            },
            {
                icon: "FaInstagram",
                link: "/",
            },

        ],
    }
]

export default function AboutFounders() {

    const [modal, setModal] = useState({active: false, index: 0})

    return (

        <div className="flex items-center justify-center h-full w-full">
            <div className="max-w-[1000px] w-full flex flex-col items-center justify-center">
                {

                    projects.map( (project, index) => {

                        return <FounderProject index={index} title={project.title} links={project.links} mainLink={project.mainLink} setModal={setModal} key={index} />

                    })

                }
            </div>
            <FounderModal modal={modal} projects={projects}/>
        </div>
        
    )

}
