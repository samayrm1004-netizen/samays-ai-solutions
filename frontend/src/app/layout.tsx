import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { BackgroundPaths } from '@/components/ui/background-paths';

export const metadata: Metadata = {
  title: 'Samays AI Sessions Marketplace',
  description: 'OAuth-ready sessions marketplace with role-based dashboards and booking flow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BackgroundPaths />
        <div className="container">
          <Navbar />
          {children}
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Samays AI Solutions. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
