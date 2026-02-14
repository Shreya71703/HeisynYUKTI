'use client'

import { useState } from "react"
import DotButton from "@/app/components/buttons/dot-button"
import DotButtonDark from "@/app/components/buttons/dot-button-dark"
import Link from "next/link"
import { FiArrowUpRight } from "react-icons/fi"

import JobPortalComponents from "../job-portal"
import RoadmapComponents from "../roadmap"
import CourseComponents from "../courses"
import InterviewQAComponents from "../interview"
import ResumeComponents from "../resume"
import LiveInterviewComponents from "../live-interview"
import MoralSupport from "../moral-support"

// DATA
const data = {

    button_two_text: "Roadmap",
    button_one_text: "Courses",
    button_five_text: "Resume",
    button_four_text: "Interview Q&A",
    button_six_text: "Live Interview",
    button_seven_text: "Moral Support",
    button_three_text: "Job Portal",
    button_three_link: "https://job-finder-henna-one.vercel.app"

}

export default function CareerNavigation() {

    const [activeLink, setActiveLink] = useState("Roadmap")

    const renderComponent = () => {

        switch (activeLink) {

            case "Roadmap":
                return <RoadmapComponents />
            case "Courses": 
                return <CourseComponents />
            case "Resume": 
                return <ResumeComponents />
            case "Interview Q&A":
                return <InterviewQAComponents />
            case "Moral Support":
                return <MoralSupport />
            // case "Live Interview":
            //     return <LiveInterviewComponents />
            // case "Job Portal":
            //     return <JobPortalComponents />
            default:
                return <RoadmapComponents />

        }

    }

    return (

        <div className="space-y-6">
            <div className="flex items-center justify-center flex-wrap md:justify-normal gap-2 md:gap-4">
                {
                    
                    activeLink === "Roadmap" ? (
                        <DotButtonDark onClick={() => setActiveLink("Roadmap")}>
                            {data.button_two_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Roadmap")}>
                            {data.button_two_text}
                        </DotButton>
                    )
                
                }
                {
                
                    activeLink === "Courses" ? (
                        <DotButtonDark onClick={() => setActiveLink("Courses")}>
                            {data.button_one_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Courses")}>
                            {data.button_one_text}
                        </DotButton>
                    )
                
                }
                {
                
                    activeLink === "Resume" ? (
                        <DotButtonDark onClick={() => setActiveLink("Resume")}>
                            {data.button_five_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Resume")}>
                            {data.button_five_text}
                        </DotButton>
                    )
                
                }
                {
                
                    activeLink === "Interview Q&A" ? (
                        <DotButtonDark onClick={() => setActiveLink("Interview Q&A")}>
                            {data.button_four_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Interview Q&A")}>
                            {data.button_four_text}
                        </DotButton>
                    )
                
                }
                {
                
                activeLink === "Moral Support" ? (
                    <DotButtonDark onClick={() => setActiveLink("Moral Support")}>
                        {data.button_seven_text}
                    </DotButtonDark>
                ) : (
                    <DotButton onClick={() => setActiveLink("Moral Support")}>
                        {data.button_seven_text}
                    </DotButton>
                )
            
            }
                {/* {
                
                    activeLink === "Live Interview" ? (
                        <DotButtonDark onClick={() => setActiveLink("Live Interview")}>
                            {data.button_six_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Live Interview")}>
                            {data.button_six_text}
                        </DotButton>
                    )
                
                } */}
                {/* {
                
                    activeLink === "Job Portal" ? (
                        <DotButtonDark onClick={() => setActiveLink("Job Portal")}>
                            {data.button_three_text}
                        </DotButtonDark>
                    ) : (
                        <DotButton onClick={() => setActiveLink("Job Portal")}>
                            {data.button_three_text}
                        </DotButton>
                    )
                
                } */}
                <Link href={ data.button_three_link }>
                    <DotButton>
                        { data.button_three_text }
                        <span className=""><FiArrowUpRight /></span>
                    </DotButton>
                </Link>
            </div>
            <div className="rounded-xl bg-neutral-100 min-h-dvh p-4">
                { renderComponent() }
            </div>
        </div>

    )

}
