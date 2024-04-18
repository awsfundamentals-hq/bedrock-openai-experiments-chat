import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@radix-ui/react-navigation-menu';
import Image from 'next/image';
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-gray-800 fixed top-0 inset-x-0 z-10">
      <div className="mx-auto max-w-7xl px-2">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a
              className="hover:opacity-75 transition-opacity duration-300"
              href="https://awsfundamentals.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                className="h-8 w-8 rounded-full mr-4"
                width={32}
                height={32}
              />
            </a>

            <NavigationMenu>
              <NavigationMenuList className="flex space-x-4">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/notes"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    📝 Notes
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/chat"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    💬 Chat
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
