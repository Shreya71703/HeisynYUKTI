import React, { useState } from "react";

const BasicDetails = (props) => {
    const { resumeInfo, setResumeInfo, setPage } = props;
    const [addressSection, setAddressSection] = useState(false);

    const handleChange = (field, value) => {
        const updateProfile = { ...resumeInfo.profile, [field]: value };
        setResumeInfo({ ...resumeInfo, profile: updateProfile });
    };

    const inputFields = [
        { label: "First name:", type: "text", placeholder: "Your first name", field: "firstname" },
        { label: "Last name:", type: "text", placeholder: "Your last name", field: "lastname" },
        { label: "Phone Number:", type: "tel", placeholder: "phone number", field: "phone", maxLength: 10, pattern: "[0-9]{10}" },
        { label: "Email address:", type: "email", placeholder: "Your email address", field: "email" },
        { label: "LinkedIn:", type: "url", placeholder: "https://example.com", field: "linkedin", pattern: "https://.*" },
        { label: "GitHub:", type: "url", placeholder: "https://example.com", field: "github", pattern: "https://.*" },
        { label: "Portfolio or Website:", type: "url", placeholder: "https://example.com", field: "website", pattern: "https://.*" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {
				
					inputFields.map(({ label, type, placeholder, field, maxLength, pattern }) => (

						<div key={field} className="flex flex-col gap-2">
							<label className="text-sm text-white font-medium">{label}</label>
							{
							
								field === "phone" ? (
									<div className="flex">
										<span className="inline-flex items-center px-3 rounded-l-md bg-gray-200">+</span>
										<input
											type={type}
											className="border rounded-r-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
											placeholder={placeholder}
											maxLength={maxLength}
											pattern={pattern}
											value={resumeInfo.profile[field]}
											onChange={(e) => handleChange(field, e.target.value)}
										/>
									</div>
								) : (
									<input
										type={type}
										className="border rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder={placeholder}
										pattern={pattern}
										value={resumeInfo.profile[field]}
										onChange={(e) => handleChange(field, e.target.value)}
									/>
								)
							
							}
							{
							
								field === "email" && (
									<p className="text-sm text-gray-300">
										Enter email address to get contacted for jobs
									</p>
								)
							
							}
						</div>

					))
				
				}
                {
				
					addressSection && (
						<div className="flex flex-col">
							<label className="text-sm text-white font-medium">Address:</label>
							<input
								type="text"
								className="border rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="City, Country"
								value={resumeInfo.profile.address}
								onChange={(e) => handleChange("address", e.target.value)}
							/>
						</div>
					)
				
				}
            </div>
            <button
                className={`bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    addressSection && "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => setAddressSection(!addressSection)}
                disabled={addressSection}
            >
                <span>Add Address</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            <div className="flex justify-center mt-8">
                <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                    onClick={() => setPage((p) => p + 1)}
                >
                    <span>Save</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default BasicDetails;
