const Earth = ({ color = '#000', size = 48 }: { color?: string; size?: number }) => (
    <svg width={`${size}px`} height={`${size}px`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="white" fillOpacity="0.01" />
        <path fillRule="evenodd" clipRule="evenodd" d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 24H44" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M24 44C28.4183 44 32 35.0457 32 24C32 12.9543 28.4183 4 24 4C19.5817 4 16 12.9543 16 24C16 35.0457 19.5817 44 24 44Z" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.85791 10.1421C13.4772 13.7614 18.4772 16 24 16V16C29.5229 16 34.5229 13.7614 38.1422 10.1421" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38.1422 37.8579C34.5229 34.2386 29.5229 32 24 32C18.4772 32 13.4772 34.2386 9.85791 37.8579" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default Earth;