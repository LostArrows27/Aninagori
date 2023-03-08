'use client'

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import UsernamePopup from '../auth/UsernamePopup';
import { UserInfo } from './NavBar';

interface Props {
    myUserInfo: UserInfo | undefined
}

const ProfilePicture: React.FC<Props> = ({ myUserInfo }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [openUsernamePopup, setOpenUsernamePopup] = useState(myUserInfo?.username === "guess")

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            setIsOpen(false);
            await signOut();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div ref={ref}>
            <img
                src={myUserInfo?.image ?? '/images/default-profile-pic.png'}
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = '/images/default-profile-pic.png';
                }}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen ?
                <div className="absolute top-12 right-1 z-50 w-56 py-2 mt-1 bg-white rounded-md shadow-lg">
                    {myUserInfo?.username === "guess" ?
                        <button onClick={() => setOpenUsernamePopup(true)} className="px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">Set username</button> :
                        <div className="px-4 py-2 text-gray-800">{myUserInfo?.username}</div>
                    }
                    <div className="border-t border-gray-100"></div>
                    <Link
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                    >
                        View Profile
                    </Link>
                    <button
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div> : null
            }
            <UsernamePopup isOpen={openUsernamePopup} onClose={() => setOpenUsernamePopup(false)}/>
        </div>
    );
};

export default ProfilePicture;