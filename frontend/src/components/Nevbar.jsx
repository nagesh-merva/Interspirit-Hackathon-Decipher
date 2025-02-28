import React from "react";
import { Search, Users, Bell } from "lucide-react";

function Nevbar() {
    return (
        <div className="fixed w-full bg-white shadow-md ">
            <nav className="flex items-center justify-between px-4 py-4">
                {/* Left Section - Logo */}
                <div className="flex items-center gap-2">
                    <img src="./cloud.png" alt="BrandPulse Logo" className="h-9" />
                    <h1 className="text-xl font-bold">BrandPulse</h1>
                </div>

                {/* Center Section - Navigation */}
                <div className="flex items-center gap-6">
                    <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                        Dashboard
                    </a>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                        Tweet/Post Details
                    </a>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                        Settings
                    </a>
                </div>

                {/* Right Section - Icons & Profile */}
                <div className="flex items-center gap-4">
                    <Search className="h-5 w-5 text-gray-500 cursor-pointer hover:text-black" />
                    <Users className="h-5 w-5 text-gray-500 cursor-pointer hover:text-black" />
                    <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-black" />
                    <img
                        src="/girl.png"
                        alt="User Profile"
                        className="h-8 w-8 rounded-full border border-gray-300"
                    />
                </div>
            </nav>
        </div>
    );
}

export default Nevbar;
