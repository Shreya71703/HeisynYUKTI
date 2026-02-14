import Container from "../components/container"
import ResourceContainer from "./resource-container"

// DATA
const data = {

    title: "Access the tools for, your Success.",
    subtitle: "Resources",

}

export default function ResourcesPage(){

    return (

        <section className="bg-white py-20">
            <Container>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <h1 className="text-center md:text-left font-syne font-medium text-2xl">{ data.subtitle }</h1>
                        <h2 className="text-5xl md:text-6xl lg:text-[140px] tracking-wide text-center md:text-left text-neutral-900 font-bebas uppercase">{ data.title }</h2>
                    </div>
                </div>
                <div className="rounded-xl bg-light min-h-dvh p-4">
                    <ResourceContainer />
                </div>
            </Container>
        </section>

    )

}
