'use client'

import CategorySelector from "@/app/components/category-selector"
import { useState, useEffect, useCallback } from "react"
import { resource_data } from "@/app/resource/resourceData"
import ResourceCard from "../resource-card"

export default function ResourceContainer() {

    const [selectedYear, setSelectedYear] = useState(2020)
    const [selectedSem, setSelectedSem] = useState("--")
    const [selectedResource, setSelectedResource] = useState("--")
    const [selectedCourse, setSelectedCourse] = useState("BCA")
    const [filteredResources, setFilteredResources] = useState([])

    const resourceCategoryArray = [
        {

            categories: [

                "BCA",
                "BTECH",
                "MBA",
                "MCA",

            ],
            selected: selectedCourse,

        },
        {

            categories: [

                2020,
                2021,
                2022,
                2023,

            ],
            selected: selectedYear,

        },
        {

            categories: [

                "First Sem",
                "Second Sem",
                "Third Sem",
                "Fourth Sem",
                "Fifth Sem",
                "Sixth Sem",
                "Seventh Sem",
                "Eighth Sem",
                "--"

            ],
            selected: selectedSem,

        },
        {

            categories: [

                "Notes",
                "Question Papers",
                "Assignments",

            ],
            selected: selectedResource,

        },

    ]

    // Function to filter resources based on selected categories
    const filterResources = useCallback(() => {

        const filtered = resource_data.filter(resource => {

            return (

                (selectedCourse === resource.course) &&
                (selectedYear === resource.year) &&
                (selectedSem === resource.sem || selectedSem === "--") &&
                (selectedResource === resource.type || selectedResource === "--")

            )

        })
        setFilteredResources(filtered)

    }, [selectedCourse, selectedYear, selectedSem, selectedResource])

    // Effect to filter resources whenever the selections change
    useEffect(() => {

        filterResources()

    }, [filterResources])

    return (

        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end gap-6 flex-wrap">
                {

                    resourceCategoryArray.map( ( data, index ) => (

                        <CategorySelector
                            key={ index }
                            categories={ data.categories }
                            selectedCategory={ data.selected }
                            onSelect={(category) => {
                                if (index === 0) setSelectedCourse(category)
                                else if (index === 1) setSelectedYear(category)
                                else if (index === 2) setSelectedSem(category)
                                else if (index === 3) setSelectedResource(category)
                            }}
                        />

                    ))

                }
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 rounded-lg">
                {

                    filteredResources.map( ( data, index ) => (

                        <ResourceCard 
                            key={ index }
                            src={ data.src }
                            title={ data.title }
                            path={ data.path }
                        />

                    ))

                }
            </div>
        </div>

    )

}
