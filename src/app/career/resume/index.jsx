import React, { useState } from "react"
import BasicDetails from "./basic-detail"
import EducationDetails from "./education-detail"
import ProfessionalDetails from "./professional-detail"
import ResumeTemplate from "./resume-template"

// DATA
const data = {

    title: "Resume Builder",
    mobile_warning: "Use in Desktop or laptop, not compatible with Mobile Devices !",

}

const ResumeComponents = () => {

    const [page, setPage] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Listen for window resize to set mobile view
    React.useEffect(() => {

        const handleResize = () => {

            setIsMobile(window.innerWidth <= 798)

        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)

    }, [])

    const initialState = {

        profile: {
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            linkedin: "",
            github: "",
            website: "",
            address: "",
        },
        professional: {
            summary: "",
            skills: "",
            work: [],
        },
        education: [],
        certification: [],

    }

    const [resumeInfo, setResumeInfo] = useState(initialState)

    const formPage = [
        "Profile Details",
        "Professional Experience",
        "Educational Details",
    ]

    const renderForm = () => {

        switch (page) {

            case 0:
                return (
                    <BasicDetails
                        resumeInfo={resumeInfo}
                        setResumeInfo={setResumeInfo}
                        setPage={setPage}
                    />
                )
            case 1:
                return (
                    <ProfessionalDetails
                        resumeInfo={resumeInfo}
                        setResumeInfo={setResumeInfo}
                        setPage={setPage}
                    />
                )
            case 2:
                return (
                    <EducationDetails
                        resumeInfo={resumeInfo}
                        setResumeInfo={setResumeInfo}
                        setPage={setPage}
                    />
                )
            default:
                return

        }

    }

    return (
        <div className="flex flex-col gap-4 py-6">
            <div className={`${ page === 3 ? "hidden" : "flex" } flex-col gap-4 items-center w-full`}>
                <h2 className="text-3xl lg:text-4xl font-sora font-semibold">{ data.title }</h2>
                <div className="w-full rounded-lg">
                    <div className={`w-full bg-green-500 h-2 rounded-lg`} style={{ width: `${page === 0 ? 33.3 : page === 1 ? 66.6 : 100}%`, }}/>
                </div>
            </div>
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
                <div className={`${page === 3 ? "hidden" : "block"}`}>
                    <div className="p-8 rounded-lg bg-gray-900 shadow-xl">
                        <h2 className="text-white text-center text-2xl mb-4">{formPage[page]}</h2>
                        {renderForm()}
                    </div>
                </div>
                <div className={`w-full`}>
                    <ResumeTemplate resumeInfo={resumeInfo} page={page} />
                </div>
            </div>
            <h4 className="md:hidden text-2xl text-red-500 text-center font-sora font-semibold">{ data.mobile_warning }</h4>
        </div>

    )

}
export default ResumeComponents

