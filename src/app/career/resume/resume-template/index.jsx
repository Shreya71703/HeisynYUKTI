import React, { useRef } from "react"
import { useReactToPrint } from "react-to-print" 

const ResumeTemplate = (props) => {

	const { resumeInfo, page } = props
	const contentRef = useRef()

	const handlePrint = useReactToPrint({

		content: () => {
			console.log(contentRef.current); // Check if contentRef is correctly assigned
			return contentRef.current;
		},

	})

	return (
		<div>
			<div className="space-y-4" ref={contentRef}>
				<div className="space-y-1 text-center">
					<h1 className="text-4xl font-bold">
						{ resumeInfo.profile.firstname } { resumeInfo.profile.lastname }
					</h1>
					<div className="flex justify-center space-x-4 flex-wrap divide-x">
						{
						
							resumeInfo.profile.email && (

								<a href={`mailto:${resumeInfo.profile.email}`} className="text-blue-500" target="_blank" rel="noopener noreferrer">
									{resumeInfo.profile.email}
								</a>

							)
						
						}
						{
						
							resumeInfo.profile.linkedin && (

								<a href={resumeInfo.profile.linkedin} className="pl-4 text-blue-500" target="_blank" rel="noopener noreferrer">
									LinkedIn
								</a>

							)
						
						}
						{
						
							resumeInfo.profile.github && (

								<a href={resumeInfo.profile.github} className="pl-4 text-blue-500" target="_blank" rel="noopener noreferrer">
									GitHub
								</a>

							)
						
						}
						{
						
							resumeInfo.profile.website && (

								<a href={resumeInfo.profile.website} className="pl-4 text-blue-500" target="_blank" rel="noopener noreferrer">
									Portfolio
								</a>

							)
						
						}
					</div>
					<div className="text-center">
						<p>📞 { resumeInfo.profile.phone } <br/> { resumeInfo.profile.address }</p>
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-xl font-semibold border-b pb-2">SUMMARY</h3>
					<p className="break-words">{ resumeInfo.professional.summary }</p>
				</div>
				<div className="space-y-4">
					<h3 className="text-xl font-semibold border-b pb-2">SKILLS</h3>
					<ul className="list-disc pl-5">
						{
						
							resumeInfo.professional.skills.split("\n").map((skill, i) => (

								<li className="break-words" key={i}>{skill.trim()}</li>

							))
						
						}
					</ul>
				</div>
				{
				
					resumeInfo.professional.work.length ? (
						
						<div className="space-y-4">
							<h3 className="text-xl font-semibold border-b pb-2">WORK EXPERIENCE</h3>
							{
							
								resumeInfo.professional.work.map((work, i) => (

									<div key={i} className="space-y-2">
										<div className="flex justify-between items-baseline">
											<div>
												<h5 className="text-lg font-medium">{work.jobTitle}</h5>
												<h6 className="text-md font-normal">{work.company}</h6>
											</div>
											<h6 className="text-md">{work.startDate} &#8212 {work.endDate}</h6>
										</div>
										<ul className="list-disc pl-5">
											{
											
												work.jobDetails.split("\n").map((detail, index) =>
													detail.length ? <li key={index}>{detail}</li> : null
												)
											
											}
										</ul>
									</div>

								))
							
							}
						</div>

					) : null
				
				}
				<div className="space-y-4">
					<h3 className="text-xl font-semibold border-b pb-2">EDUCATION</h3>
					{
					
						resumeInfo.education.map((education, i) => (

							<div key={i} className="flex justify-between items-baseline">
								<div>
									<h5 className="text-lg font-medium">{education.course}</h5>
									<h6 className="text-md font-normal">{education.college}</h6>
								</div>
								<h6 className="text-md">{education.startDate} &#8212 {education.endDate}</h6>
							</div>

						))
					
					}
				</div>
				{
				
					resumeInfo.certification.length ? (

					<div className="space-y-4">
						<h3 className="text-xl font-semibold border-b pb-2">CERTIFICATIONS</h3>
						{
						
							resumeInfo.certification.map((cert, i) => (

								<div key={i} className="space-y-1">
									<h5 className="text-lg font-medium">{cert.link}</h5>
									<p className="break-words">{cert.details}</p>
								</div>

							))
						
						}
					</div>

					) : null
				
				}
			</div>
			<div className="flex flex-col md:flex-row gap-4 items-center justify-center py-6">
				<button
					className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium font-syne"
					disabled={page !== 3}
					onClick={() => window.location.reload()}
				>
					Create New
				</button>
				<button
					className="bg-green-500 text-white px-6 py-2 rounded-full font-medium font-syne"
					onClick={handlePrint} // Use the handlePrint function for printing
				>
					Print this out!
				</button>
			</div>
		</div>

	)

}
export default ResumeTemplate
