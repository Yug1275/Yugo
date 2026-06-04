import Navbar from '../components/common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;