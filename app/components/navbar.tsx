'use client';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { MenuIcon } from 'lucide-react';

const Navbar: React.FC = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <nav className='w-full p-4 bg-primary text-background flex items-center justify-between shadow-md font-bold'>
            <h1>Ciné Swipe</h1>
            {/* Example static menu for demonstration; in a real app, you would control open/close state and anchorEl */}
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