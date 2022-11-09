"use client"

import { SignOutButton } from "@clerk/nextjs";
import * as Menu from "@radix-ui/react-navigation-menu";
import cx from "classnames";
import Image from "next/image";
import React from "react";

type UserButtonProps = {
  user: {

    name: string
    email: string
    image: string
  }
}

export const UserButton = ({ user }: UserButtonProps) => {
  return (
    <Menu.Root className="relative">
      <Menu.List className="flex flex-row rounded bg-white  p-2 ">


        <Menu.Item>
          <Menu.Trigger

          >
            <Image src={user.image} alt="User profile image" width={64} height={64} className="rounded-full w-8 h-8" />
          </Menu.Trigger>

          <Menu.Content
            className={cx(
              "absolute top-0 left-0 rounded",
              "radix-motion-from-start:animate-enter-from-left",
              "radix-motion-from-end:animate-enter-from-right",
              "radix-motion-to-start:animate-exit-to-left",
              "radix-motion-to-end:animate-exit-to-right"
            )}
          >
            <div className="p-3 w-full">
              <div className="w-full flex flex-col space-y-2">

                <span>{user.name}</span>




              </div>
            </div>
          </Menu.Content>
        </Menu.Item>

        <Menu.Indicator
          className={cx(
            "z-10",
            "top-[100%] flex items-end justify-center h-2 overflow-hidden",
            "radix-state-visible:animate-fade-in",
            "radix-state-hidden:animate-fade-out",
            "transition-[width_transform] duration-[250ms] ease-[ease]"
          )}
        >
          <div className="top-1 relative bg-white dark:bg-gray-800 w-2 h-2 rotate-45" />
        </Menu.Indicator>
      </Menu.List>

      <div
        className={cx(
          "absolute flex justify-center",
          ""
        )}
        style={{
          perspective: "2000px",
        }}
      >
        <Menu.Viewport
          className={cx(
            "relative mt-2 shadow-lg rounded-md bg-white dark:bg-gray-800 overflow-hidden",
            "w-radix-navigation-menu-viewport",
            "h-radix-navigation-menu-viewport",
            "radix-state-open:animate-scale-in-content",
            "radix-state-closed:animate-scale-out-content",
            "origin-[top_center] transition-[width_height] duration-300 ease-[ease]"
          )}
        />
      </div>
    </Menu.Root>
  );
};

