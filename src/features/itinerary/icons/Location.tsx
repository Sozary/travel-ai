const Location = ({ color = '#000', size = 48, className }: { color?: string; size?: number; className?: string }) => (
    <svg
        width={`${size}px`}
        height={`${size}px`}
        viewBox="-4 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" >
            <g id="Icon-Set-Filled" transform="translate(-106.000000, -413.000000)" fill={color}>
                <path d="M118,422 C116.343,422 115,423.343 115,425 C115,426.657 116.343,428 118,428 C119.657,428 121,426.657 121,425 C121,423.343 119.657,422 118,422 L118,422 Z M118,430 C115.239,430 113,427.762 113,425 C113,422.238 115.239,420 118,420 C120.761,420 123,422.238 123,425 C123,427.762 120.761,430 118,430 L118,430 Z M118,413 C111.373,413 106,418.373 106,425 C106,430.018 116.005,445.011 118,445 C119.964,445.011 130,429.95 130,425 C130,418.373 124.627,413 118,413 L118,413 Z" id="location" >
                </path>
            </g>
        </g>
    </svg>
);

export default Location; 