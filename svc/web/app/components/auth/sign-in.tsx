"use client"

import { signIn } from "next-auth/react";
import React, { useState } from "react"
import { Button } from "../button";

export const SignIn: React.FC = () => {

    const [loading, setLoading] = useState(false)
    return (
        <div className="flex flex-col min-h-screen justify-center bg-gradient-to-tr from-black  to-[#060823]">
            <div className="absolute">
                <svg
                    className="inset-0 w-screen fill-transparent h-screen [mask-image:linear-gradient(to_bottom,white_15%,transparent_95%)]"
                    strokeWidth={0.5}
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="grad1">
                            <stop offset={0} stopColor="#33427B" />
                            <stop offset={1} stopColor="#B9C8F1" />
                        </linearGradient>
                    </defs>

                    <path
                        stroke="url(#grad1)"
                        strokeWidth={0.2}
                        d="M128.5 219.236c-.309.178-.69.178-1 0l-78.262-45.185a1 1 0 0 1-.5-.866v-90.37a1 1 0 0 1 .5-.866L127.5 36.764a1 1 0 0 1 1 0l31.923 18.43a1 1 0 0 0 1.237-.19l9.691-10.57a1 1 0 0 0-.237-1.542L128.5 18.289a1 1 0 0 0-1 0L33.238 72.71a1 1 0 0 0-.5.866v108.845c0 .358.19.688.5.866l94.262 54.423a.998.998 0 0 0 1 0l94.263-54.423a1 1 0 0 0 .5-.866v-49.206a1 1 0 0 0-1.217-.976l-14 3.108a1.001 1.001 0 0 0-.783.976v36.861a1 1 0 0 1-.5.866L128.5 219.236Z"
                    />
                    <path
                        stroke="url(#grad1)"
                        strokeWidth={0.2}
                        d="M223.321 105.737a1 1 0 0 0-1.387-.92l-87.51 36.649c-1.125.471-.588 2.163.603 1.899l87.541-19.436a.999.999 0 0 0 .783-.978l-.03-17.214ZM118.207 114.232c-.824.899.372 2.21 1.343 1.472l75.494-57.462a1 1 0 0 0-.104-1.66l-14.892-8.634a1 1 0 0 0-1.239.19l-60.602 66.094ZM203.173 62.11a.999.999 0 0 1 1.105-.071l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397Z"
                    />
                    <path
                        stroke="url(#grad1)"
                        strokeWidth={0.2}
                        d="M88.026 152.224c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397a.999.999 0 0 1 1.105-.07l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38Z"
                    />
                </svg>
            </div>
            <main className="h-full relative">
                <div className="flex items-center justify-center">
                    <div className="drop-shadow-cta hover:drop-shadow-none duration-1000">

                        <Button
                            loading={loading}
                            size="lg"
                            type="secondary"
                            iconLeft={
                                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                            onClick={() => {
                                setLoading(true)
                                signIn("github");
                            }}
                        >
                            Sign in with GitHub
                        </Button>
                    </div>
                </div>
            </main >
        </div >
    )
}