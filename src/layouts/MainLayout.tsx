import { ReactNode } from 'react';
import Navbar from '../shared/components/Navbar';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
}; 