'use client';

import React from 'react'
import { Button } from './ui/button'
import { Menu } from 'lucide-react'
import Sidebar from './sidebar'
import { useState, useEffect } from 'react'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet"
  

interface MobileSidebarProps {
    apiLimitCount: number;
    isPro: boolean;
}

function MobileSidebar({ apiLimitCount = 0, isPro = false }: MobileSidebarProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if(!isMounted) {
        return null
    }

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="ghost" size="icon" className='md:hidden'>
                    <Menu/>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className='p-0'>
                <Sidebar apiLimitCount={apiLimitCount} isPro={isPro} />
            </SheetContent>

        </Sheet>
    )
}

export default MobileSidebar
