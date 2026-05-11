'use client'; 
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { Code,  LayoutDashboard, MessageCircle, Music2Icon, } from 'lucide-react';

import {cn} from '@/lib/utils';
import { usePathname } from 'next/navigation';

const monstserrat = Montserrat({
    weight:"600",
    subsets:["latin"]
})

const routes=[
    {
        label:"Dashboard",
        icon: LayoutDashboard,
        href:"/dashboard",
        color: "text-sky-500"
    },
    {
        label:"Conversation",
        icon: MessageCircle,
        href:"/conversation",
        color: "text-violet-500"
    },
    {
        label:"Music Generation",
        icon: Music2Icon,
        href:"/music",
        color: "text-emrald-500"
    },
    {
        label:"Code  Generator",
        icon: Code,
        href:"/code",
        color: "text-green-700"
    },

]

function Sidebar() {
    const pathname = usePathname()
  return (
    <div className="space-y-4
    py-4 flex flex-col h-full
    bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
        <div className="px-3 py-2 flex-1">
            <Link href="/" className="flex items-center pl-3 mb-14">
                <div className='relative w-8 h-8 mr-4'>
                    <Image 
                        fill
                        alt="Logo"
                        src="/logo.png"
                    />
                </div>
                <h1 className={cn('text-2xl font-bold', monstserrat.className)}>
                    promptForge
                </h1>
            </Link>
            <div className='space-y-1'>
                {routes.map((route)=>(
                    <Link
                        href={route.href}
                        key={route.href}
                        className={cn('text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all',
                            pathname===route.href ? 'text-white bg-white/20' : 'text-zinc-400')}
                    >
                        <div className='flex items-center flex-1'>
                            <route.icon className={cn('w-5 h-5 mr-3', route.color)}/>
                            {route.label}

                        </div>
                    </Link>
                ))}

            </div>
        </div>
    </div>
  )
}

export default Sidebar
