import React, { useCallback, useEffect, useState } from "react";

const ProfessionalDetails = (props) => {
    const { resumeInfo, setResumeInfo, setPage } = props;

    const [workSection, setWorkSection] = useState([]);

    const [workData, setWorkData] = useState({
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        jobDetails: "",
    });

    const workFields = [
        { label: "Job Title:", placeholder: "Software developer", field: "jobTitle" },
        { label: "Company/Employer:", placeholder: "Employer(Company) name", field: "company" },
        { label: "Start date:", placeholder: "Enter start date jan 2022", field: "startDate" },
        { label: "End date:", placeholder: "Enter end date jan 2023", field: "endDate", note: "write present if ongoing" },
    ];

    const handleInputChange = (field) => (e) => {
        setWorkData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const workExperienceForm = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={workSection.length}>
            {workFields.map(({ label, placeholder, field, note }) => (
                <div key={field} className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">{label}</label>
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="px-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onChange={handleInputChange(field)}
                    />
                    {note && <p className="mt-2 text-sm text-gray-300">{note}</p>}
                </div>
            ))}
            <div className="md:col-span-2 flex flex-col gap-2">
                <label className="block text-sm font-medium text-white">Job Details:</label>
                <textarea
                    placeholder="Describe your role and achievements"
                    className="px-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                    onChange={handleInputChange("jobDetails")}
                />
                <p className="mt-2 text-sm text-gray-300">Hit enter for newline</p>
            </div>
        </div>
    );

    const saveData = useCallback(() => {
        const isEmpty = Object.values(workData).some((x) => x.trim() === "");
        if (isEmpty) return;

        const duplicate = () => {
            let arr = resumeInfo.professional.work;
            return arr.some((item) => JSON.stringify(item) === JSON.stringify(workData));
        };

        if (duplicate()) return;

        const updatedValue = {
            ...resumeInfo.professional,
            work: resumeInfo.professional.work.concat(workData),
        };
        const updateResumeInfo = {
            ...resumeInfo,
            professional: updatedValue,
        };
        setResumeInfo(updateResumeInfo);
    }, [workData, resumeInfo, setResumeInfo]);

    useEffect(() => {
        saveData();
    }, [workSection.length, saveData]);

    const createWorkSection = () => {
        setWorkSection((prev) => prev.concat(workExperienceForm()));
    };

    return (
        <div className="space-y-8">
            <div className="mb-4">
                <label className="block text-sm font-medium text-white">Summary:</label>
                <textarea
                    placeholder="Introduce yourself by pitching your skills & explaining how they can be of value to a company"
                    rows={4}
                    value={resumeInfo.professional.summary}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 resize-none"
                    onChange={(e) => {
                        const updateValue = {
                            ...resumeInfo.professional,
                            summary: e.target.value,
                        };
                        const updateResumeInfo = {
                            ...resumeInfo,
                            professional: updateValue,
                        };
                        setResumeInfo(updateResumeInfo);
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-white">Skills:</label>
                <textarea
                    placeholder="Communication, Teambuilding, etc.."
                    rows={4}
                    value={resumeInfo.professional.skills}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 resize-none"
                    onChange={(e) => {
                        const updateValue = {
                            ...resumeInfo.professional,
                            skills: e.target.value,
                        };
                        const updateResumeInfo = {
                            ...resumeInfo,
                            professional: updateValue,
                        };
                        setResumeInfo(updateResumeInfo);
                    }}
                />
                <p className="mt-2 text-sm text-gray-300">Hit enter for newline</p>
            </div>
            {workSection}
            <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={createWorkSection}
            >
                <span>Add Work Experience</span>
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 4v16m8-8H4"></path>
                </svg>
            </button>
            <div className="flex justify-center space-x-8">
                <button
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => {
                        setPage((p) => p - 1);
                    }}
                >
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back
                </button>
                <button
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => {
                        saveData();
                        setPage((p) => p + 1);
                    }}
                >
                    Save & Submit
                    <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProfessionalDetails;
