'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { MenuIcon } from 'lucide-react';

const Navbar: React.FC = () => {
    const [svgWidth, setSvgWidth] = useState(1440);
    const svgHeight = 100;
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (navRef.current) {
                setSvgWidth(navRef.current.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Génère dynamiquement le path pour que la courbe s'adapte à la largeur
    const getPath = (width: number, height: number) => {
        // Exemple : vague douce qui s'adapte à la largeur
        const controlX = width * 0.8;
        const controlY = height;
        return `M0,0 H${width} V${height * 0.6} Q${controlX},${height} 0,${height * 0.6} Z`;
    };

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <nav ref={navRef} className='w-full p-4 text-background flex items-center justify-between font-bold fixed z-50 '>
            <div className='absolute left-0 top-0 w-full h-[100px] pointer-events-none -z-10'>
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                >
                    <defs>
                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
                        </filter>
                    </defs>
                    <path
                        d={getPath(svgWidth, svgHeight)}
                        fill="var(--color-primary)"
                        filter="url(#shadow)"
                    />
                </svg>
            </div>
            <h1 className=''>Ciné Swipe</h1>
            <button id='menu-button' className='cursor-pointer' onClick={handleClick}><MenuIcon /></button>
            <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Home</MenuItem>
                <MenuItem onClick={handleClose}>Films</MenuItem>
                <MenuItem onClick={handleClose}>Contact</MenuItem>
            </Menu>
        </nav>
    );
};

export default Navbar;