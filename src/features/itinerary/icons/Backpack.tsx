const Backpack = ({ color = '#000', size = 48, className }: { color?: string; size?: number; className?: string }) => (
    <svg
        width={`${size}px`}
        height={`${size}px`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path fillRule="evenodd" clipRule="evenodd" d="M9 3.75L9.75 3H14.25L15 3.75V5.25H17.25L18 6V9C18 9.66637 17.7103 10.2651 17.25 10.6771V14.25H18.75L19.5 15V18.75L18.75 19.5H17.25V20.25L16.5 21H7.5L6.75 20.25V19.5H5.25L4.5 18.75L4.5 15L5.25 14.25H6.75L6.75 10.6771C6.28969 10.2651 6 9.66638 6 9V6L6.75 5.25H9V3.75ZM10.5 5.25H13.5V4.5H10.5V5.25ZM8.25 11.25V15.75H15.75V11.25H14.25V12.75H12.75V11.25H11.25V12.75H9.75V11.25H8.25ZM9.75 9.75H8.25C7.83579 9.75 7.5 9.41421 7.5 9V6.75H16.5V9C16.5 9.41421 16.1642 9.75 15.75 9.75H14.25V9H12.75V9.75H11.25V9H9.75V9.75ZM15.75 17.25H8.25V19.5H15.75V17.25ZM6.75 18L6.75 15.75H6L6 18H6.75ZM17.25 15.75V18H18V15.75H17.25Z" fill={color} />
    </svg>
);

export default Backpack; 