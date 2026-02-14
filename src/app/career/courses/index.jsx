import { useState } from "react"
import CategorySelector from "@/app/components/category-selector"

// IMPORT COURSE DATA
import { course_data } from "./courseData"
import CourseCard from "./course-card"

export default function CourseComponents(){

    const [selectedCategory, setSelectedCategory] = useState("Select a category")

    const courseCategories = [
        "Web Development",
        "Artificial Intelligence",
        "App Development",
        "Business Intelligence",
        "Video Editing",
        "Social Media",
        "Select a category"
    ];

    // Filter the data based on the selected category
    const filteredCourses = selectedCategory === "Select a category"
        ? course_data
        : course_data.filter(course => course.category === selectedCategory);

    return (

        <section className="space-y-6">
            <CategorySelector 
                categories={ courseCategories }
                selectedCategory={selectedCategory}
                onSelect={(category) => setSelectedCategory(category)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {

                    filteredCourses.map(( course, index ) => (

                        <CourseCard
                            key={ index }
                            title={ course.title }
                            src={ course.src }
                            auther={ course.auther }
                            price={ course.price }
                            discount_price={ course.discount_price }
                            rating={ course.rating }
                        />

                    ))

                }
            </div>
        </section>

    )

}
