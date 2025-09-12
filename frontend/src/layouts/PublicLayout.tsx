import { Outlet } from 'react-router-dom';
import Header from '../components/Headers'; 

const PublicLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

export default PublicLayout;