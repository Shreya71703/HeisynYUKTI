'use client'

import Image from 'next/image';
import { useScroll, useTransform, motion} from 'framer-motion';
import { useRef } from 'react';
import styles from './styles.module.scss';

// IMPORT PICTURES
import Picture1 from '/public/images/founders/main.webp';
import Picture2 from '/public/images/founders/hackdiwas.jpg';
import Picture3 from '/public/images/founders/gdsc.jpg';
import Picture4 from '/public/images/founders/promotion.jpg'
import Picture5 from '/public/images/founders/tedx.jpg'
import Picture6 from '/public/images/founders/uhack-1.jpg'
import Picture7 from '/public/images/founders/uhack-2.jpg'

export default function ImageParallax() {

    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    })

    const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
    const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
    const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
    const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
    const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

    const pictures = [
        {
            src: Picture1,
            scale: scale4
        },
        {
            src: Picture2,
            scale: scale5
        },
        {
            src: Picture3,
            scale: scale6
        },
        {
            src: Picture4,
            scale: scale5
        },
        {
            src: Picture5,
            scale: scale6
        },
        {
            src: Picture6,
            scale: scale8
        },
        {
            src: Picture7,
            scale: scale9
        }
    ]

    return (

        <div ref={container} className="hidden md:block h-[300vh] relative">
            <div className="sticky overflow-hidden top-0 h-screen">
                {

                    pictures.map( ({src, scale}, index) => {

                        return (

                            <motion.div key={index} style={{scale}} className={styles.el}>
                                <div className={styles.imageContainer}>
                                    <Image
                                        src={src}
                                        fill
                                        alt="image"
                                        placeholder='blur'
                                    />
                                </div>
                            </motion.div>

                        )
                    })

                }
            </div>
        </div>

    )

}
