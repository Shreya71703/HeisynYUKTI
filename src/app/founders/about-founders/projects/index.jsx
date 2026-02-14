'use client';
import Link from 'next/link';
import React from 'react'

export default function FounderProject({index, title, setModal, links, mainLink}) {

    return (

            <div 
                onMouseEnter={() => {setModal({active: true, index})}} 
                onMouseLeave={() => {setModal({active: false, index})}} 
                className="w-full px-2 sm:px-10 py-6 md:px-20 md:py-10 lg:px-24 lg:py-14 cursor-pointer transition-all duration-200 hover:opacity-50 border-t border-gray-300 last:border-b"
            >
                <Link href={mainLink} target='blank' className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl transition-all duration-500 group:hover:-translate-x-2">{title}</h2>
                    <div className="flex items-center gap-4">
                        <p className="hidden md:block text-sm md:text-base font-light transition-all duration-500 group:hover:translate-x-2">Co Founder</p>
                        {

                            links.map(( data, index ) => (

                                <Link key={index} href={data.link} className="md:hidden">
                                    <div className="">
                                        <span className="text-xl">{<data.icon/>}</span>
                                    </div>
                                </Link>

                            ))

                        }
                    </div>
                </Link>
            </div>
        
        
    )
}
