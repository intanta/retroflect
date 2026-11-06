export function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			width="40"
			height="40"
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<g filter="url(#filter0_iiii_2004_313)">
				<rect width="40" height="40" rx="8" fill="url(#paint0_radial_2004_313)" />
				<path
					d="M24.3623 23.333C24.7195 23.333 25.0498 23.5238 25.2285 23.833L27.9229 28.5C28.3077 29.1667 27.8264 30 27.0566 30H23.5938C23.2365 30 22.9062 29.8094 22.7275 29.5L20.0332 24.833C19.6483 24.1664 20.1288 23.3332 20.8984 23.333H24.3623ZM14.001 15C14.553 15.0003 14.9999 15.448 15 16V22.333C15 22.8853 14.5523 23.333 14 23.333H11.001C10.4487 23.333 10.001 22.8853 10.001 22.333V16C10.0011 15.4478 10.4488 15 11.001 15H14.001ZM28.999 15C29.5512 15 29.9989 15.4478 29.999 16V22.333C29.999 22.8853 29.5513 23.333 28.999 23.333H26C25.4477 23.333 25 22.8853 25 22.333V16C25.0001 15.4478 25.4478 15 26 15H28.999ZM24 10C24.5521 10.0001 24.9999 10.4479 25 11V14C25 14.5522 24.5522 14.9999 24 15H16C15.4479 14.9997 15.001 14.5521 15.001 14V11C15.0011 10.4478 15.4488 10 16.001 10H24Z"
					fill="white"
				/>
			</g>
			<defs>
				<filter
					id="filter0_iiii_2004_313"
					x="0"
					y="-3"
					width="43"
					height="45"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dx="3" dy="2" />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.458824 0 0 0 0 0.952941 0 0 0 0 0.980392 0 0 0 1 0"
					/>
					<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2004_313" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="-3" />
					<feGaussianBlur stdDeviation="3" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.00784314 0 0 0 0 0.0352941 0 0 0 0 0.686275 0 0 0 1 0"
					/>
					<feBlend
						mode="normal"
						in2="effect1_innerShadow_2004_313"
						result="effect2_innerShadow_2004_313"
					/>
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="-2" />
					<feGaussianBlur stdDeviation="1" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.34 0"
					/>
					<feBlend
						mode="normal"
						in2="effect2_innerShadow_2004_313"
						result="effect3_innerShadow_2004_313"
					/>
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="2" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.807103 0 0 0 0 0.838143 0 0 0 0 1 0 0 0 0.4 0"
					/>
					<feBlend
						mode="normal"
						in2="effect3_innerShadow_2004_313"
						result="effect4_innerShadow_2004_313"
					/>
				</filter>
				<radialGradient
					id="paint0_radial_2004_313"
					cx="0"
					cy="0"
					r="1"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(8.4375 8.75) rotate(60.3215) scale(33.4506)">
					<stop stopColor="#60F2FA" />
					<stop offset="0.461372" stopColor="#0283FD" />
					<stop offset="1" stopColor="#000556" />
				</radialGradient>
			</defs>
		</svg>
	)
}
