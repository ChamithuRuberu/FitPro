import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Workout Program | FitPro',
    description: 'Create advanced, customized workout programs for your clients',
};

export default function CreateProgramLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
} 