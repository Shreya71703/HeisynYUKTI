import React, { useState, useEffect, useCallback } from "react";

const EducationDetails = (props) => {
    const { resumeInfo, setResumeInfo, setPage } = props;

    const [educationSection, setEducationSection] = useState([]);
    const [certificateSection, setCertificateSection] = useState([]);

    const [educationData, setEducationData] = useState({
        college: "",
        course: "",
        startDate: "",
        endDate: "",
    });

    const [certificateData, setCertificateData] = useState({
        link: "",
        details: "",
    });

    const educationFields = [
        { label: "College/University or School:", placeholder: "school, college or university name", key: "college" },
        { label: "Course/Degree or Graduation:", placeholder: "Bachelors, Masters or High school diploma", key: "course" },
        { label: "Start date:", placeholder: "Enter start date or year jan 2022", key: "startDate" },
        { label: "End date:", placeholder: "Enter end date or year march 2022", key: "endDate" },
    ];

    const certificateFields = [
        { label: "Certificate Link:", placeholder: "Enter Certificate", type: "url", key: "link" },
        { label: "Additional Details:", placeholder: "e.g. Level 1 or React or Data Science", type: "text", key: "details" },
    ];

    const saveEducationData = useCallback(() => {
        const isEmpty = Object.values(educationData).some((x) => x === "");
        if (isEmpty) return;

        const duplicate = () => resumeInfo.education.some((edu) => JSON.stringify(edu) === JSON.stringify(educationData));
        if (duplicate()) return;

        const updateValue = {
            ...resumeInfo,
            education: resumeInfo.education.concat(educationData),
        };
        setResumeInfo(updateValue);
    }, [educationData, resumeInfo, setResumeInfo]);

    const saveCertificateData = useCallback(() => {
        const isEmpty = Object.values(certificateData).some((x) => x.trim() === "");
        if (isEmpty) return;

        const duplicate = () => resumeInfo.certification.some((cert) => JSON.stringify(cert) === JSON.stringify(certificateData));
        if (duplicate()) return;

        const updateValue = {
            ...resumeInfo,
            certification: resumeInfo.certification.concat(certificateData),
        };
        setResumeInfo(updateValue);
    }, [certificateData, resumeInfo, setResumeInfo]);

    useEffect(() => {
        saveEducationData();
    }, [educationSection.length, saveEducationData]);

    useEffect(() => {
        saveCertificateData();
    }, [certificateSection.length, saveCertificateData]);

    const createCertificateSection = () => {
        setCertificateSection(certificateSection.concat(
            <div className="mb-6" key={certificateSection.length}>
                {certificateFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-white text-sm mb-2">{field.label}</label>
                        <input
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            className="block w-full px-4 py-2 text-sm border rounded mb-4"
                            onChange={(e) => {
                                setCertificateData((prev) => ({ ...prev, [field.key]: e.target.value }));
                            }}
                        />
                    </div>
                ))}
            </div>
        ));
    };

    const createEducationSection = () => {
        setEducationSection(educationSection.concat(educationForm()));
    };

    const educationForm = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={educationSection.length}>
            {educationFields.map((field) => (
                <div key={field.key}>
                    <label className="block text-white text-sm mb-2">{field.label}</label>
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        className="block w-full px-4 py-2 text-sm border rounded"
                        onChange={(e) => {
                            setEducationData((prev) => ({ ...prev, [field.key]: e.target.value }));
                        }}
                    />
                    {field.key === "endDate" && <small className="text-gray-500">Write &quot;present&quot; if ongoing</small>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {educationFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-white text-sm mb-2">{field.label}</label>
                        <input
                            type="text"
                            placeholder={field.placeholder}
                            className="block w-full px-4 py-2 text-sm border rounded"
                            onChange={(e) => {
                                setEducationData((prev) => ({ ...prev, [field.key]: e.target.value }));
                            }}
                        />
                    </div>
                ))}
            </div>

            {educationSection}
            {certificateSection}

            <div className="flex items-center gap-4">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    onClick={createEducationSection}
                >
                    Add Education
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    onClick={() => {
                        saveEducationData();
                        createCertificateSection();
                    }}
                >
                    Add Certificates
                </button>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    onClick={() => setPage((p) => p - 1)}
                >
                    Back
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    onClick={() => {
                        saveEducationData();
                        saveCertificateData();
                        setPage((p) => p + 1);
                    }}
                >
                    Save & Submit
                </button>
            </div>
        </div>
    );
};

export default EducationDetails;
