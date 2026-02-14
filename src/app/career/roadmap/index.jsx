import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { roadmap_data } from "./roadmapData"
import Image from "next/image"

const data = {
    noroadmap: "No roadmap for this category yet."
}

export default function RoadmapComponents() {
    const { user } = useUser();
    const [inputField, setInputField] = useState("");
    const [selectedRoadmapCategory, setSelectedRoadmapCategory] = useState("");
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoad = () => {
        setImageLoaded(true);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setSelectedRoadmapCategory(inputField);
        setFormSubmitted(true);
        setImageLoaded(false);
    }

    const selectedRoadmap = roadmap_data.find(
        (roadmap) => roadmap.category.toLowerCase().includes(selectedRoadmapCategory.toLowerCase())
    );

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-medium font-sora">Welcome, {user?.firstName}!</h2>
            {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[400px]">
                    <label className="text-sm font-sora text-neutral-600">Enter roadmap category (e.g., Frontend, Backend)</label>
                    <input
                        type="text"
                        value={inputField}
                        onChange={(e) => setInputField(e.target.value)}
                        className="text-sm px-4 py-2 border rounded"
                        required
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                        Submit
                    </button>
                </form>
            ) : (
                <>
                    {selectedRoadmap ? (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-4xl font-sora font-medium">{selectedRoadmap.title}</h3>
                            <div className="relative w-full h-full">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50"></div>
                                    </div>
                                )}
                                <Image
                                    src={selectedRoadmap.src}
                                    alt={selectedRoadmap.alt}
                                    width={3000}
                                    height={3000}
                                    className="w-full h-full rounded-xl"
                                    onLoadingComplete={handleImageLoad}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg font-medium font-sora">{data.noroadmap}</p>
                    )}
                </>
            )}
        </section>
    );
}
