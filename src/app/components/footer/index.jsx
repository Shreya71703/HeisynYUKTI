import Container from "../container"

export default function Footer(){

    return (

        <footer className="relative bg-light h-[500px]" style={{clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)"}}>
            <div className="relative h-[calc(100vh+500px)] -top-[100vh]">
                <div className="h-[500px] sticky top-[calc(100vh-500px)]">
                    <Container>
                        <div className="relative w-full h-full py-12 grid grid-cols-2 gap-6">
                            <div>

                            </div>
                            <div className="flex items-end">    
                                
                            </div>
                        </div>
                    </Container>
                    <h2 className="absolute bottom-0 left-0 text-5xl lg:text-[180px] font-syne font-bold uppercase">Codify.</h2>
                </div>
            </div>
        </footer>

    )

}
