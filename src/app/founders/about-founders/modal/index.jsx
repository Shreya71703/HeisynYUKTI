import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import gsap from 'gsap';

const scaleAnimation = {
    initial: { scale: 0, x: "-50%", y: "-50%" },
    enter: { scale: 1, x: "-50%", y: "-50%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } },
    closed: { scale: 0, x: "-50%", y: "-50%", transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }
}

export default function FounderModal({ modal, projects }) {
    const { active, index } = modal;
    const modalContainer = useRef(null);
    const cursor = useRef(null);
    const cursorLabel = useRef(null);

    useEffect(() => {
        //Move Container
        let xMoveContainer = gsap.quickTo(modalContainer.current, "left", { duration: 0.8, ease: "power3" });
        let yMoveContainer = gsap.quickTo(modalContainer.current, "top", { duration: 0.8, ease: "power3" });
        //Move cursor
        let xMoveCursor = gsap.quickTo(cursor.current, "left", { duration: 0.5, ease: "power3" });
        let yMoveCursor = gsap.quickTo(cursor.current, "top", { duration: 0.5, ease: "power3" });
        //Move cursor label
        let xMoveCursorLabel = gsap.quickTo(cursorLabel.current, "left", { duration: 0.45, ease: "power3" });
        let yMoveCursorLabel = gsap.quickTo(cursorLabel.current, "top", { duration: 0.45, ease: "power3" });

        window.addEventListener('mousemove', (e) => {
            const { pageX, pageY } = e;
            xMoveContainer(pageX);
            yMoveContainer(pageY);
            xMoveCursor(pageX);
            yMoveCursor(pageY);
            xMoveCursorLabel(pageX);
            yMoveCursorLabel(pageY);
        });

        modalContainer.current.addEventListener('click', () => {
            const activeProject = projects[index];
            if (activeProject && activeProject.mainLink) {
                window.open(activeProject.mainLink, '_blank');
            }
        });

    }, [index, projects]);

    return (
        <>
            <motion.div 
                ref={modalContainer} 
                variants={scaleAnimation} 
                initial="initial" 
                animate={active ? "enter" : "closed"} 
                className={`size-44 sm:size-52 lg:size-72 rounded-full absolute bg-white overflow-hidden flex items-center justify-center pointer-events-none`}
            >
                <div 
                    style={{ top: index * -100 + "%" }} 
                    className="h-full w-full absolute transition-[top] duration-500 ease-custom-bezier"
                >
                    {
                        projects.map((project, idx) => {
                            const { src, color } = project;
                            return (
                                <div 
                                    className="h-full w-full flex items-center justify-center" 
                                    style={{ backgroundColor: color }} 
                                    key={`modal_${idx}`}
                                >
                                    <Image
                                        src={`/images/founder-details/${src}`}
                                        width={300}
                                        height={0}
                                        alt="image"
                                        className="h-auto object-cover"
                                    />
                                </div>
                            );
                        })
                    }
                </div>
            </motion.div>

            {/* Pointer-events none for cursor-related interaction */}
            <motion.div 
                ref={cursor} 
                className="size-10 rounded-full absolute z-[2] flex items-center justify-center text-sm font-light pointer-events-none" 
                variants={scaleAnimation} 
                initial="initial" 
                animate={active ? "enter" : "closed"}
            ></motion.div>

            <motion.div 
                ref={cursorLabel} 
                className="size-20 rounded-full absolute z-[2] flex items-center justify-center text-sm font-light bg-transparent pointer-events-none" 
                variants={scaleAnimation} 
                initial="initial" 
                animate={active ? "enter" : "closed"}
            >
                <Image
                    src="/icons/arrow-up-right.svg"
                    alt='arrow'
                    width={100}
                    height={0}
                    className="size-16"
                />
            </motion.div>
        </>
    );
}
