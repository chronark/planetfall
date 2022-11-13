export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
			<main className="h-full relative">{children}</main>
		</div>
	);
}
